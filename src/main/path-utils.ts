import { homedir } from 'os'
import { join } from 'path'

export function expandTilde(filePath: string): string {
  if (filePath === '~' || filePath.startsWith('~/') || filePath.startsWith('~\\')) {
    return join(homedir(), filePath.slice(1))
  }
  return filePath
}

export function getHomeDir(): string {
  return homedir()
}

export function getDefaultProjectsPath(): string {
  const home = homedir()
  const platform = process.platform
  if (platform === 'win32') {
    // Windows: try Documents/Projects, then Desktop
    return join(home, 'Desktop')
  } else if (platform === 'darwin') {
    return join(home, 'Developer')
  } else {
    return join(home, 'projects')
  }
}
