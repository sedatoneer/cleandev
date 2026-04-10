import React, { useState, useCallback } from 'react'
import { Translations } from '../../i18n'
import { useDeadProjects } from '../../hooks/useDeadProjects'
import { ProjectCard } from './ProjectCard'
import { ScanProgressBar } from './ScanProgress'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const THRESHOLD_OPTIONS = [30, 90, 180, 365]

// Icons
const IconFolder = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3.5C1 2.7 1.7 2 2.5 2h2.3l1.4 1.5H11.5c.8 0 1.5.7 1.5 1.5v5c0 .8-.7 1.5-1.5 1.5h-9C1.7 11.5 1 10.8 1 10V3.5z" />
  </svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="4" />
    <path d="M9 9l2.5 2.5" />
  </svg>
)

const IconPlay = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3,2 11,7 3,12" fill="currentColor" stroke="none" />
  </svg>
)

const IconTrash = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M5 3.5V2.5h4v1M4 3.5l.5 8h5l.5-8" />
  </svg>
)

const IconCheck = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l4 4 6-6" />
  </svg>
)

const IconGrid = () => (
  <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="4" height="4" rx="0.5" />
    <rect x="8.5" y="1.5" width="4" height="4" rx="0.5" />
    <rect x="1.5" y="8.5" width="4" height="4" rx="0.5" />
    <rect x="8.5" y="8.5" width="4" height="4" rx="0.5" />
  </svg>
)

const IconInbox = () => (
  <svg width="32" height="32" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 8h11l-2-5h-7L1.5 8z" />
    <path d="M1.5 8v3c0 .3.2.5.5.5h10c.3 0 .5-.2.5-.5V8" />
    <path d="M4.5 10h5" />
  </svg>
)

interface Props {
  lang: Lang
  tr: Translations
}

const DEMO_PROJECTS = [
  { id: 'd1', name: 'old-react-dashboard',  rootPath: 'C:\\Users\\dev\\projects\\old-react-dashboard',  projectType: 'node'    as const, lastCommitDate: new Date(Date.now() - 540 * 86400000).toISOString(), daysInactive: 540, totalCleanableSize: 889_000_000,   cleanableFolders: [{ path: '...\\node_modules', size: 847_000_000, label: 'node_modules', exists: true }, { path: '...\\dist', size: 42_000_000, label: 'dist', exists: true }], isSelected: false },
  { id: 'd2', name: 'ml-experiment-2022',   rootPath: 'C:\\Users\\dev\\projects\\ml-experiment-2022',   projectType: 'python'  as const, lastCommitDate: new Date(Date.now() - 730 * 86400000).toISOString(), daysInactive: 730, totalCleanableSize: 412_000_000,   cleanableFolders: [{ path: '...\\.venv', size: 380_000_000, label: '.venv', exists: true }, { path: '..\\__pycache__', size: 32_000_000, label: '__pycache__', exists: true }], isSelected: false },
  { id: 'd3', name: 'rust-cli-tool',        rootPath: 'C:\\Users\\dev\\projects\\rust-cli-tool',        projectType: 'rust'    as const, lastCommitDate: new Date(Date.now() - 280 * 86400000).toISOString(), daysInactive: 280, totalCleanableSize: 4_800_000_000, cleanableFolders: [{ path: '...\\target', size: 4_800_000_000, label: 'target', exists: true }], isSelected: false },
  { id: 'd4', name: 'android-prototype',    rootPath: 'C:\\Users\\dev\\projects\\android-prototype',    projectType: 'java'    as const, lastCommitDate: new Date(Date.now() - 420 * 86400000).toISOString(), daysInactive: 420, totalCleanableSize: 1_240_000_000, cleanableFolders: [{ path: '...\\.gradle', size: 980_000_000, label: '.gradle', exists: true }, { path: '...\\build', size: 260_000_000, label: 'build', exists: true }], isSelected: false },
  { id: 'd5', name: 'flutter-poc',          rootPath: 'C:\\Users\\dev\\projects\\flutter-poc',          projectType: 'flutter' as const, lastCommitDate: new Date(Date.now() - 190 * 86400000).toISOString(), daysInactive: 190, totalCleanableSize: 623_000_000,   cleanableFolders: [{ path: '...\\build', size: 580_000_000, label: 'build', exists: true }, { path: '...\\.dart_tool', size: 43_000_000, label: '.dart_tool', exists: true }], isSelected: false },
  { id: 'd6', name: 'go-microservice',      rootPath: 'C:\\Users\\dev\\projects\\go-microservice',      projectType: 'go'      as const, lastCommitDate: new Date(Date.now() - 365 * 86400000).toISOString(), daysInactive: 365, totalCleanableSize: 210_000_000,   cleanableFolders: [{ path: '...\\vendor', size: 210_000_000, label: 'vendor', exists: true }], isSelected: false },
  { id: 'd7', name: 'rails-saas-prototype', rootPath: 'C:\\Users\\dev\\projects\\rails-saas-prototype', projectType: 'ruby'    as const, lastCommitDate: new Date(Date.now() - 500 * 86400000).toISOString(), daysInactive: 500, totalCleanableSize: 340_000_000,   cleanableFolders: [{ path: '...\\vendor\\bundle', size: 340_000_000, label: 'vendor/bundle', exists: true }], isSelected: false },
  { id: 'd8', name: 'phoenix-api',          rootPath: 'C:\\Users\\dev\\projects\\phoenix-api',          projectType: 'elixir'  as const, lastCommitDate: new Date(Date.now() - 260 * 86400000).toISOString(), daysInactive: 260, totalCleanableSize: 185_000_000,   cleanableFolders: [{ path: '...\\_build', size: 120_000_000, label: '_build', exists: true }, { path: '...\\deps', size: 65_000_000, label: 'deps', exists: true }], isSelected: false },
  { id: 'd9', name: 'dotnet-webapi',        rootPath: 'C:\\Users\\dev\\projects\\dotnet-webapi',        projectType: 'dotnet'  as const, lastCommitDate: new Date(Date.now() - 310 * 86400000).toISOString(), daysInactive: 310, totalCleanableSize: 490_000_000,   cleanableFolders: [{ path: '...\\bin', size: 310_000_000, label: 'bin', exists: true }, { path: '...\\obj', size: 180_000_000, label: 'obj', exists: true }], isSelected: false },
]

export function DeadProjectsTab({ tr }: Props) {
  const dp = tr.deadProjects
  const [rootPath, setRootPath] = useState('')
  const [threshold, setThreshold] = useState(180)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [cleanResult, setCleanResult] = useState<{ freed: number; isDryRun: boolean } | null>(null)

  const {
    projects,
    scanState,
    progress,
    selectedProjects,
    totalSelectedSize,
    startScan,
    loadDemo,
    toggleSelect,
    selectAll,
    deselectAll,
    cleanSelected
  } = useDeadProjects()

  const handleFolderPick = useCallback(async () => {
    if (!window.api) return
    const path = await window.api.openFolderDialog()
    if (path) {
      setRootPath(path)
      setCleanResult(null)
    }
  }, [])

  const handleScan = useCallback(() => {
    if (!rootPath) return
    startScan(rootPath, threshold)
    setCleanResult(null)
  }, [rootPath, threshold, startScan])

  const handleCleanConfirm = useCallback(async () => {
    setShowConfirm(false)
    const results = await cleanSelected(dryRun)
    const totalFreed = results.reduce((s, r) => s + r.freedBytes, 0)
    setCleanResult({ freed: totalFreed, isDryRun: dryRun })
  }, [cleanSelected, dryRun])

  const allSelected = projects.length > 0 && projects.every((p) => p.isSelected)
  const hasResults = scanState === 'done' && projects.length > 0
  const isEmpty = scanState === 'done' && projects.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1>{dp.title}</h1>
        <p>{dp.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="folder-input-wrap" onClick={handleFolderPick}>
          <IconFolder />
          <span className={`folder-input-text ${rootPath ? 'has-value' : ''}`}>
            {rootPath || dp.selectFolder}
          </span>
        </div>

        <div className="threshold-group">
          {THRESHOLD_OPTIONS.map((d) => (
            <button
              key={d}
              className={`threshold-btn ${threshold === d ? 'active' : ''}`}
              onClick={() => setThreshold(d)}
            >
              {dp.thresholdDays(d)}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={handleScan}
          disabled={!rootPath || scanState === 'scanning'}
        >
          <IconSearch />
          {scanState === 'scanning' ? dp.scanning : dp.scanButton}
        </button>

        <button
          className="btn-text"
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 10px', height: '32px', color: 'var(--text-3)' }}
          onClick={() => { setRootPath('~/projects (demo)'); loadDemo(DEMO_PROJECTS) }}
          title="Demo verisi yükle"
        >
          <IconPlay />
          Demo
        </button>
      </div>

      {/* Result banner */}
      {cleanResult && (
        <div className={`result-banner ${cleanResult.isDryRun ? 'dry' : 'success'}`}>
          {cleanResult.isDryRun
            ? <><strong>{dp.dryRunDone}</strong> — {dp.wouldFree(formatBytes(cleanResult.freed))}</>
            : <><strong>{dp.cleanDone}</strong> — {dp.freedSpace(formatBytes(cleanResult.freed))}</>
          }
        </div>
      )}

      {/* Stats bar */}
      {hasResults && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{projects.length}</span>
            <span className="stat-label">{dp.columnName.toLowerCase()}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value accent">
              {formatBytes(projects.reduce((s, p) => s + p.totalCleanableSize, 0))}
            </span>
            <span className="stat-label">{dp.totalRecoverable.toLowerCase()}</span>
          </div>
        </div>
      )}

      {/* Table toolbar (when results exist) */}
      {hasResults && (
        <div className="table-toolbar">
          <span className="toolbar-count">{dp.projectsFound(projects.length)}</span>
          <button className="btn-text" onClick={allSelected ? deselectAll : selectAll}>
            <IconCheck />
            {allSelected ? dp.deselectAll : dp.selectAll}
          </button>
        </div>
      )}

      {/* Content */}
      {scanState === 'scanning' ? (
        <ScanProgressBar progress={progress} tr={dp} />
      ) : isEmpty ? (
        <div className="state-container">
          <IconGrid />
          <div className="state-title">{dp.noResults}</div>
          <div className="state-hint">{dp.noResultsHint}</div>
        </div>
      ) : scanState === 'idle' ? (
        <div className="state-container">
          <IconInbox />
          <div className="state-title" style={{ color: 'var(--text-3)' }}>
            {dp.selectFolder}
          </div>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="table-head">
            <div className="table-head-cell" />
            <div className="table-head-cell">{dp.columnName}</div>
            <div className="table-head-cell">{dp.columnType}</div>
            <div className="table-head-cell">{dp.inactive}</div>
            <div className="table-head-cell right">{dp.totalRecoverable}</div>
          </div>

          {/* Table rows */}
          <div className="table-container">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onToggle={toggleSelect} tr={dp} />
            ))}
          </div>
        </>
      )}

      {/* Action bar */}
      {selectedProjects.length > 0 && (
        <div className="action-bar">
          <div className="action-bar-info">
            <strong>{selectedProjects.length}</strong> {dp.columnName.toLowerCase()} selected
            {totalSelectedSize > 0 && <> &mdash; <strong>{formatBytes(totalSelectedSize)}</strong> {dp.totalRecoverable.toLowerCase()}</>}
          </div>
          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            <IconTrash />
            {dp.cleanSelected(selectedProjects.length, formatBytes(totalSelectedSize))}
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{dp.confirmTitle}</div>
            <p className="modal-body">
              {dp.confirmText(selectedProjects.length, formatBytes(totalSelectedSize))}
            </p>

            <div className="modal-toggle" onClick={() => setDryRun(!dryRun)}>
              <div className={`modal-toggle-track ${dryRun ? 'on' : ''}`}>
                <div className="modal-toggle-thumb" />
              </div>
              <span className="modal-toggle-label">{dp.dryRunLabel}</span>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                {dp.cancel}
              </button>
              <button className={`btn-confirm ${dryRun ? 'dry' : ''}`} onClick={handleCleanConfirm}>
                {dp.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
