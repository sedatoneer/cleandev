import { remove } from 'fs-extra'
import { existsSync } from 'fs'
import { ScannedProject, CleanResult } from '../shared/types'

export async function cleanProjects(
  projects: ScannedProject[],
  dryRun: boolean
): Promise<CleanResult[]> {
  const results: CleanResult[] = []

  for (const project of projects) {
    const result: CleanResult = {
      projectId: project.id,
      projectName: project.name,
      freedBytes: 0,
      deletedFolders: [],
      errors: [],
      dryRun
    }

    for (const folder of project.cleanableFolders) {
      if (!folder.exists || !existsSync(folder.path)) continue

      if (dryRun) {
        result.freedBytes += folder.size
        result.deletedFolders.push(folder.path)
      } else {
        try {
          await remove(folder.path)
          result.freedBytes += folder.size
          result.deletedFolders.push(folder.path)
        } catch (err) {
          result.errors.push(`${folder.label}: ${(err as Error).message}`)
        }
      }
    }

    results.push(result)
  }

  return results
}
