import { homedir, platform } from 'os'
import { join } from 'path'
import { existsSync } from 'fs'
import { getFolderSize } from './scanner'
import { GlobalCacheItem, CacheCategory } from '../shared/types'

interface CacheDefinition {
  id: string
  name: string
  description: { tr: string; en: string }
  path: string
  category: CacheCategory
}

function buildDefinitions(): CacheDefinition[] {
  const home = homedir()
  const os = platform()
  const win = os === 'win32'
  const mac = os === 'darwin'
  const local = win
    ? (process.env.LOCALAPPDATA ?? join(home, 'AppData', 'Local'))
    : ''
  const appdata = win
    ? (process.env.APPDATA ?? join(home, 'AppData', 'Roaming'))
    : ''

  return [
    // Node
    {
      id: 'npm-cache',
      name: 'npm Cache',
      description: {
        tr: 'Node.js npm global paket önbelleği.',
        en: 'Node.js npm global package cache.'
      },
      path: win ? join(local, 'npm-cache') : join(home, '.npm'),
      category: 'node'
    },
    {
      id: 'pnpm-store',
      name: 'pnpm Store',
      description: {
        tr: 'pnpm global paket deposu. Temizlemek bağımlılıkları yeniden indirir.',
        en: 'pnpm global package store. Cleaning re-downloads dependencies.'
      },
      path: win
        ? join(local, 'pnpm', 'store')
        : mac
          ? join(home, 'Library', 'pnpm', 'store')
          : join(home, '.local', 'share', 'pnpm', 'store'),
      category: 'node'
    },
    {
      id: 'bun-cache',
      name: 'Bun Cache',
      description: {
        tr: 'Bun JavaScript çalışma ortamı paket önbelleği.',
        en: 'Bun JavaScript runtime package cache.'
      },
      path: win
        ? join(local, 'bun', 'install', 'cache')
        : join(home, '.bun', 'install', 'cache'),
      category: 'node'
    },
    {
      id: 'yarn-cache',
      name: 'Yarn Cache',
      description: {
        tr: 'Yarn klasik paket önbelleği.',
        en: 'Yarn classic package cache.'
      },
      path: win
        ? join(local, 'Yarn', 'Cache')
        : mac
          ? join(home, 'Library', 'Caches', 'Yarn')
          : join(home, '.cache', 'yarn'),
      category: 'node'
    },
    // Python
    {
      id: 'pip-cache',
      name: 'pip Cache',
      description: {
        tr: 'Python pip paket önbelleği.',
        en: 'Python pip package cache.'
      },
      path: win
        ? join(local, 'pip', 'Cache')
        : mac
          ? join(home, 'Library', 'Caches', 'pip')
          : join(home, '.cache', 'pip'),
      category: 'python'
    },
    {
      id: 'uv-cache',
      name: 'uv Cache',
      description: {
        tr: 'Python uv paket yöneticisi önbelleği.',
        en: 'Python uv package manager cache.'
      },
      path: win
        ? join(local, 'uv', 'cache')
        : mac
          ? join(home, 'Library', 'Caches', 'uv')
          : join(home, '.cache', 'uv'),
      category: 'python'
    },
    {
      id: 'poetry-cache',
      name: 'Poetry Cache',
      description: {
        tr: 'Python Poetry paket önbelleği.',
        en: 'Python Poetry package cache.'
      },
      path: win
        ? join(appdata, 'pypoetry', 'Cache')
        : mac
          ? join(home, 'Library', 'Caches', 'pypoetry')
          : join(home, '.cache', 'pypoetry'),
      category: 'python'
    },
    // Rust
    {
      id: 'cargo-registry',
      name: 'Cargo Registry',
      description: {
        tr: 'Rust cargo global crate kayıt önbelleği.',
        en: 'Rust cargo global crate registry cache.'
      },
      path: join(home, '.cargo', 'registry'),
      category: 'rust'
    },
    {
      id: 'cargo-git',
      name: 'Cargo Git Cache',
      description: {
        tr: 'Rust cargo git bağımlılık önbelleği.',
        en: 'Rust cargo git dependency cache.'
      },
      path: join(home, '.cargo', 'git'),
      category: 'rust'
    },
    // Java / JVM
    {
      id: 'gradle-caches',
      name: 'Gradle Caches',
      description: {
        tr: 'Gradle build ve bağımlılık önbelleği.',
        en: 'Gradle build and dependency cache.'
      },
      path: join(home, '.gradle', 'caches'),
      category: 'java'
    },
    {
      id: 'maven-local',
      name: 'Maven Local Repository',
      description: {
        tr: 'Maven yerel bağımlılık deposu.',
        en: 'Maven local dependency repository.'
      },
      path: join(home, '.m2', 'repository'),
      category: 'java'
    },
  ]
}

export async function scanGlobalCaches(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<GlobalCacheItem[]> {
  const defs = buildDefinitions()
  const items: GlobalCacheItem[] = []

  for (let i = 0; i < defs.length; i++) {
    const def = defs[i]
    onProgress?.(i + 1, defs.length, def.name)

    const exists = existsSync(def.path)
    const size = exists ? await getFolderSize(def.path) : 0

    items.push({
      id: def.id,
      name: def.name,
      description: def.description,
      path: def.path,
      size,
      exists,
      selected: false,
      category: def.category
    })
  }

  return items
}
