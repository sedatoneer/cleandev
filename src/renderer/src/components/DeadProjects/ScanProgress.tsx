import React from 'react'
import { ScanProgress } from '../../../../../shared/types'
import { Translations } from '../../i18n'

interface Props {
  progress: ScanProgress | null
  tr: Translations['deadProjects']
}

export function ScanProgressBar({ progress, tr }: Props) {
  const isIndeterminate = !progress || progress.total === -1
  const pct = isIndeterminate ? 0 : Math.round((progress.current / Math.max(progress.total, 1)) * 100)

  const label =
    progress?.phase === 'analyzing' && progress.projectName
      ? tr.analyzing(progress.projectName)
      : tr.discovering

  return (
    <div className="state-container">
      <div className="spinner" />
      <div className="progress-label">{label}</div>
      {!isIndeterminate && progress!.total > 0 && (
        <>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {progress!.current} / {progress!.total}
          </div>
        </>
      )}
    </div>
  )
}
