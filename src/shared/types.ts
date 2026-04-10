export type ProjectType =
  | 'node'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'flutter'
  | 'ruby'
  | 'elixir'
  | 'dotnet'
  | 'swift'
  | 'unknown'

export interface CleanableFolder {
  path: string
  size: number // bytes
  label: string // "node_modules", ".venv" etc.
  exists: boolean
}

export interface ScannedProject {
  id: string
  name: string
  rootPath: string
  projectType: ProjectType
  lastCommitDate: string | null // ISO string
  daysInactive: number
  totalCleanableSize: number // bytes
  cleanableFolders: CleanableFolder[]
  isSelected: boolean
}

export interface ScanOptions {
  rootPath: string
  inactivityThresholdDays: number // default: 180
  maxDepth: number // default: 3
  dryRun: boolean // default: true
}

export interface ScanProgress {
  current: number
  total: number
  projectName: string
  phase: 'discovering' | 'analyzing'
}

export interface CleanResult {
  projectId: string
  projectName: string
  freedBytes: number
  deletedFolders: string[]
  errors: string[]
  dryRun: boolean
}

export interface AppSettings {
  language: 'tr' | 'en'
  theme: 'dark' | 'light'
  lastProjectsPath: string
  inactivityThresholdDays: number
}

export interface ClassicScanRule {
  id: string
  name: { tr: string; en: string }
  description: { tr: string; en: string }
  path?: string
  command?: string
  selected: boolean
}

export type CacheCategory = 'node' | 'python' | 'rust' | 'java' | 'system'

export interface GlobalCacheItem {
  id: string
  name: string
  description: { tr: string; en: string }
  path: string
  size: number
  exists: boolean
  selected: boolean
  category: CacheCategory
}

export interface GlobalCacheScanProgress {
  current: number
  total: number
  name: string
}

export interface GlobalCleanResult {
  id: string
  name: string
  freedBytes: number
  error: string | null
  dryRun: boolean
}
