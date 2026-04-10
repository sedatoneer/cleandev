import { useState, useRef, useCallback } from 'react'
import type { ScannedProject, ScanProgress, CleanResult } from '../../../../shared/types'

export type ScanState = 'idle' | 'scanning' | 'done'

export function useDeadProjects() {
  const [projects, setProjects] = useState<ScannedProject[]>([])
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [cleanResults, setCleanResults] = useState<CleanResult[] | null>(null)
  const cleanupListenerRef = useRef<(() => void) | null>(null)

  const startScan = useCallback(
    async (rootPath: string, thresholdDays: number) => {
      setScanState('scanning')
      setProjects([])
      setCleanResults(null)
      setProgress(null)

      if (!window.api) { setScanState('done'); return }

      // Subscribe to progress events
      cleanupListenerRef.current = window.api.onScanProgress((p) => setProgress(p))

      try {
        const results = await window.api.scanDeadProjects({
          rootPath,
          inactivityThresholdDays: thresholdDays,
          maxDepth: 3,
          dryRun: true
        })
        setProjects(results)
      } finally {
        cleanupListenerRef.current?.()
        setScanState('done')
        setProgress(null)
      }
    },
    []
  )

  const toggleSelect = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    )
  }, [])

  const selectAll = useCallback(() => {
    setProjects((prev) => prev.map((p) => ({ ...p, isSelected: true })))
  }, [])

  const deselectAll = useCallback(() => {
    setProjects((prev) => prev.map((p) => ({ ...p, isSelected: false })))
  }, [])

  const cleanSelected = useCallback(async (dryRun: boolean) => {
    const selected = projects.filter((p) => p.isSelected)
    const results = await window.api.cleanProjects(selected, dryRun)
    setCleanResults(results)
    if (!dryRun) {
      // Remove cleaned projects or reset their cleanable sizes
      setProjects((prev) =>
        prev.map((p) => {
          const result = results.find((r) => r.projectId === p.id)
          if (!result) return p
          return {
            ...p,
            totalCleanableSize: 0,
            cleanableFolders: p.cleanableFolders.map((f) => ({
              ...f,
              exists: false,
              size: 0
            })),
            isSelected: false
          }
        })
      )
    }
    return results
  }, [projects])

  const loadDemo = useCallback((demoProjects: ScannedProject[]) => {
    setProjects(demoProjects)
    setScanState('done')
    setCleanResults(null)
  }, [])

  const selectedProjects = projects.filter((p) => p.isSelected)
  const totalSelectedSize = selectedProjects.reduce((s, p) => s + p.totalCleanableSize, 0)

  return {
    projects,
    scanState,
    progress,
    cleanResults,
    selectedProjects,
    totalSelectedSize,
    startScan,
    loadDemo,
    toggleSelect,
    selectAll,
    deselectAll,
    cleanSelected
  }
}
