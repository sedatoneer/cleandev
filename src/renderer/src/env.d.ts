/// <reference types="vite/client" />

import type {
  ScanOptions,
  AppSettings,
  ScannedProject,
  ScanProgress,
  CleanResult,
  GlobalCacheItem,
  GlobalCleanResult
} from '../../../shared/types'

declare global {
  interface Window {
    api: {
      getSettings: () => Promise<AppSettings>
      setSetting: (key: keyof AppSettings, value: unknown) => Promise<AppSettings>
      openFolderDialog: () => Promise<string | null>
      scanDeadProjects: (opts: ScanOptions) => Promise<ScannedProject[]>
      onScanProgress: (cb: (p: ScanProgress) => void) => () => void
      cleanProjects: (projects: ScannedProject[], dryRun: boolean) => Promise<CleanResult[]>
      scanGlobalCaches: () => Promise<GlobalCacheItem[]>
      onGlobalCachesProgress: (cb: (current: number, total: number, name: string) => void) => () => void
      cleanGlobalCaches: (items: GlobalCacheItem[], dryRun: boolean) => Promise<GlobalCleanResult[]>
      getPlatform: () => Promise<string>
    }
  }
}
