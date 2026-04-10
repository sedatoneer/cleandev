import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

export async function isGitRepo(dirPath: string): Promise<boolean> {
  return existsSync(join(dirPath, '.git'))
}

export async function getLastCommitDate(repoPath: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git log -1 --format=%ci', {
      cwd: repoPath,
      timeout: 5000
    })
    const trimmed = stdout.trim()
    if (!trimmed) return null
    return new Date(trimmed).toISOString()
  } catch {
    return null
  }
}

export function calcDaysInactive(isoDate: string | null): number {
  if (!isoDate) return 0
  const last = new Date(isoDate).getTime()
  const now = Date.now()
  return Math.floor((now - last) / (1000 * 60 * 60 * 24))
}
