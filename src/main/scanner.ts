import { promises as fsp } from 'fs'
import { existsSync, readdirSync } from 'fs'
import { join, basename } from 'path'
import { ProjectType, CleanableFolder, ScannedProject, ScanOptions, ScanProgress } from '../shared/types'
import { isGitRepo, getLastCommitDate, calcDaysInactive } from './git'

const CLEANABLE_FOLDERS: Record<ProjectType, string[]> = {
  node:    ['node_modules', '.next', '.nuxt', 'dist', '.parcel-cache', '.cache', '.turbo', 'out'],
  python:  ['.venv', 'venv', '__pycache__', '.pytest_cache', 'dist', '.mypy_cache', '.ruff_cache'],
  rust:    ['target'],
  go:      ['vendor'],
  java:    ['.gradle', 'build', 'out', '.m2'],
  flutter: ['.dart_tool', 'build', '.flutter-plugins', '.flutter-plugins-dependencies'],
  ruby:    ['vendor/bundle', '.bundle'],
  elixir:  ['_build', 'deps'],
  dotnet:  ['bin', 'obj'],
  swift:   ['.build'],
  unknown: ['__pycache__', 'dist', 'build', 'node_modules']
}

const TYPE_MANIFESTS: Array<{ file: string; type: ProjectType }> = [
  { file: 'package.json',    type: 'node' },
  { file: 'pyproject.toml',  type: 'python' },
  { file: 'requirements.txt', type: 'python' },
  { file: 'Pipfile',         type: 'python' },
  { file: 'setup.py',        type: 'python' },
  { file: 'Cargo.toml',      type: 'rust' },
  { file: 'go.mod',          type: 'go' },
  { file: 'pom.xml',         type: 'java' },
  { file: 'build.gradle',    type: 'java' },
  { file: 'settings.gradle', type: 'java' },
  { file: 'pubspec.yaml',    type: 'flutter' },
  { file: 'Gemfile',         type: 'ruby' },
  { file: 'mix.exs',         type: 'elixir' },
  { file: 'Package.swift',   type: 'swift' },
  { file: 'global.json',     type: 'dotnet' },
]

export function detectProjectType(dirPath: string): ProjectType {
  for (const { file, type } of TYPE_MANIFESTS) {
    if (existsSync(join(dirPath, file))) return type
  }
  // .NET detection: any .csproj / .fsproj / .vbproj file
  try {
    const entries = readdirSync(dirPath)
    for (const entry of entries) {
      if (/\.(csproj|fsproj|vbproj|sln)$/.test(entry)) return 'dotnet'
    }
  } catch {
    // unreadable
  }
  return 'unknown'
}

export async function getFolderSize(dirPath: string): Promise<number> {
  let total = 0
  try {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dirPath, entry.name)
      try {
        if (entry.isDirectory()) {
          total += await getFolderSize(full)
        } else if (entry.isFile()) {
          const stat = await fsp.stat(full)
          total += stat.size
        }
      } catch {
        // permission denied or broken symlink — skip
      }
    }
  } catch {
    // unreadable directory
  }
  return total
}

function getCleanablePaths(repoPath: string, type: ProjectType): string[] {
  const folders = CLEANABLE_FOLDERS[type] ?? CLEANABLE_FOLDERS.unknown
  return folders.map((f) => join(repoPath, f))
}

async function buildCleanableFolders(repoPath: string, type: ProjectType): Promise<CleanableFolder[]> {
  const paths = getCleanablePaths(repoPath, type)
  const result: CleanableFolder[] = []

  for (const p of paths) {
    if (existsSync(p)) {
      const size = await getFolderSize(p)
      result.push({ path: p, size, label: basename(p), exists: true })
    }
  }

  return result
}

export async function findGitRepos(
  rootPath: string,
  maxDepth: number,
  onProgress?: (name: string) => void,
  currentDepth = 0
): Promise<string[]> {
  const repos: string[] = []
  if (currentDepth > maxDepth) return repos

  let entries: string[]
  try {
    entries = readdirSync(rootPath)
  } catch {
    return repos
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'vendor' || entry === 'target') {
      continue
    }
    const full = join(rootPath, entry)
    try {
      const stat = await fsp.stat(full)
      if (!stat.isDirectory()) continue

      if (await isGitRepo(full)) {
        onProgress?.(entry)
        repos.push(full)
        // don't recurse into git repos
      } else {
        const nested = await findGitRepos(full, maxDepth, onProgress, currentDepth + 1)
        repos.push(...nested)
      }
    } catch {
      continue
    }
  }

  return repos
}

export async function scanProjectsFolder(
  opts: ScanOptions,
  onProgress: (p: ScanProgress) => void
): Promise<ScannedProject[]> {
  // Single pass: discover repos and emit discovery progress simultaneously
  const repoPaths = await findGitRepos(opts.rootPath, opts.maxDepth, (name) => {
    onProgress({ current: -1, total: -1, projectName: name, phase: 'discovering' })
  })

  // Phase 2: analyze each repo
  const projects: ScannedProject[] = []

  for (let i = 0; i < repoPaths.length; i++) {
    const repoPath = repoPaths[i]
    const name = basename(repoPath)

    onProgress({ current: i + 1, total: repoPaths.length, projectName: name, phase: 'analyzing' })

    const [lastCommitDate, projectType] = await Promise.all([
      getLastCommitDate(repoPath),
      Promise.resolve(detectProjectType(repoPath))
    ])

    const daysInactive = calcDaysInactive(lastCommitDate)

    // Skip projects that are still active (projects with no commits are always shown)
    if (lastCommitDate !== null && daysInactive < opts.inactivityThresholdDays) continue

    const cleanableFolders = await buildCleanableFolders(repoPath, projectType)
    const totalCleanableSize = cleanableFolders.reduce((sum, f) => sum + f.size, 0)

    projects.push({
      id: `${name}-${i}`,
      name,
      rootPath: repoPath,
      projectType,
      lastCommitDate,
      daysInactive,
      totalCleanableSize,
      cleanableFolders,
      isSelected: false
    })
  }

  // Sort by cleanable size descending
  projects.sort((a, b) => b.totalCleanableSize - a.totalCleanableSize)

  return projects
}
