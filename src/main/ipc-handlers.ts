import { ipcMain, dialog, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { scanProjectsFolder } from './scanner'
import { cleanProjects } from './cleaner'
import { scanGlobalCaches } from './global-caches'
import { getDefaultProjectsPath } from './path-utils'
import { remove } from 'fs-extra'
import { existsSync } from 'fs'
import { ScanOptions, AppSettings, CleanResult, ScannedProject, GlobalCacheItem, GlobalCleanResult } from '../shared/types'

const store = new Store<AppSettings>({
  defaults: {
    language: 'tr',
    theme: 'dark',
    lastProjectsPath: getDefaultProjectsPath(),
    inactivityThresholdDays: 180
  }
})

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // Settings
  ipcMain.handle('settings:get', () => store.store)

  ipcMain.handle('settings:set', (_event, key: keyof AppSettings, value: unknown) => {
    store.set(key, value as AppSettings[typeof key])
    return store.store
  })

  // Dialog
  ipcMain.handle('dialog:open-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Proje klasörünü seçin',
      defaultPath: (store.get('lastProjectsPath') as string) ?? getDefaultProjectsPath()
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0]
      store.set('lastProjectsPath', selectedPath)
      return selectedPath
    }
    return null
  })

  // Dead project scanner
  ipcMain.handle('scan:dead-projects', async (_event, opts: ScanOptions) => {
    const projects = await scanProjectsFolder(opts, (progress) => {
      mainWindow.webContents.send('scan:progress', progress)
    })
    return projects
  })

  // Dead project cleaner
  ipcMain.handle(
    'clean:projects',
    async (_event, projects: ScannedProject[], dryRun: boolean): Promise<CleanResult[]> => {
      return cleanProjects(projects, dryRun)
    }
  )

  // Global cache scanner
  ipcMain.handle('scan:global-caches', async () => {
    const caches = await scanGlobalCaches((current, total, name) => {
      mainWindow.webContents.send('scan:global-caches-progress', { current, total, name })
    })
    return caches
  })

  // Global cache cleaner
  ipcMain.handle(
    'clean:global-caches',
    async (_event, items: GlobalCacheItem[], dryRun: boolean): Promise<GlobalCleanResult[]> => {
      const results: GlobalCleanResult[] = []
      for (const item of items) {
        if (!item.exists || !existsSync(item.path)) {
          results.push({ id: item.id, name: item.name, freedBytes: 0, error: null, dryRun })
          continue
        }
        if (dryRun) {
          results.push({ id: item.id, name: item.name, freedBytes: item.size, error: null, dryRun })
        } else {
          try {
            await remove(item.path)
            results.push({ id: item.id, name: item.name, freedBytes: item.size, error: null, dryRun })
          } catch (err) {
            results.push({
              id: item.id,
              name: item.name,
              freedBytes: 0,
              error: (err as Error).message,
              dryRun
            })
          }
        }
      }
      return results
    }
  )

  // Platform
  ipcMain.handle('app:get-platform', () => process.platform)
}
