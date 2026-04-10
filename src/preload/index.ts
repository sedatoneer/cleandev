import { contextBridge, ipcRenderer } from 'electron'
import type {
  ScanOptions,
  AppSettings,
  ScannedProject,
  ScanProgress,
  CleanResult,
  GlobalCacheItem,
  GlobalCleanResult
} from '../shared/types'

contextBridge.exposeInMainWorld('api', {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  setSetting: (key: keyof AppSettings, value: unknown): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:set', key, value),

  openFolderDialog: (): Promise<string | null> => ipcRenderer.invoke('dialog:open-folder'),

  scanDeadProjects: (opts: ScanOptions): Promise<ScannedProject[]> =>
    ipcRenderer.invoke('scan:dead-projects', opts),
  onScanProgress: (cb: (p: ScanProgress) => void) => {
    const listener = (_event: unknown, data: ScanProgress) => cb(data)
    ipcRenderer.on('scan:progress', listener)
    return () => ipcRenderer.removeListener('scan:progress', listener)
  },

  cleanProjects: (projects: ScannedProject[], dryRun: boolean): Promise<CleanResult[]> =>
    ipcRenderer.invoke('clean:projects', projects, dryRun),

  scanGlobalCaches: (): Promise<GlobalCacheItem[]> =>
    ipcRenderer.invoke('scan:global-caches'),
  onGlobalCachesProgress: (cb: (current: number, total: number, name: string) => void) => {
    const listener = (_event: unknown, data: { current: number; total: number; name: string }) =>
      cb(data.current, data.total, data.name)
    ipcRenderer.on('scan:global-caches-progress', listener)
    return () => ipcRenderer.removeListener('scan:global-caches-progress', listener)
  },

  cleanGlobalCaches: (items: GlobalCacheItem[], dryRun: boolean): Promise<GlobalCleanResult[]> =>
    ipcRenderer.invoke('clean:global-caches', items, dryRun),

  getPlatform: (): Promise<string> => ipcRenderer.invoke('app:get-platform')
})
