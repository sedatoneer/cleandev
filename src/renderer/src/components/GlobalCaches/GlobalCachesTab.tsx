import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GlobalCacheItem, CacheCategory } from '../../../../../shared/types'
import { Translations, Lang } from '../../i18n'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const CATEGORY_ORDER: CacheCategory[] = ['node', 'python', 'rust', 'java', 'system']

// ── Icons ────────────────────────────────────────────────────────────────────

const IconRefresh = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 7A5.5 5.5 0 0 1 12.4 4.5" />
    <path d="M12.5 7A5.5 5.5 0 0 1 1.6 9.5" />
    <path d="M10.5 2.5l2 2-2 2" />
    <path d="M3.5 11.5l-2-2 2-2" />
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

const CheckIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 5.5l2.5 2.5 4.5-5" />
  </svg>
)

interface Props {
  lang: Lang
  tr: Translations
}

type ScanState = 'idle' | 'scanning' | 'done'

export function GlobalCachesTab({ tr }: Props) {
  const gc = tr.globalCaches
  const [items, setItems] = useState<GlobalCacheItem[]>([])
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [result, setResult] = useState<{ freed: number; isDryRun: boolean } | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const startScan = useCallback(async () => {
    if (!window.api) return
    setScanState('scanning')
    setResult(null)
    setProgress(null)

    cleanupRef.current = window.api.onGlobalCachesProgress((current, total, name) => {
      setProgress({ current, total, name })
    })

    try {
      const data = await window.api.scanGlobalCaches()
      setItems(data)
    } finally {
      cleanupRef.current?.()
      setScanState('done')
      setProgress(null)
    }
  }, [])

  // Auto-scan on first mount
  useEffect(() => {
    startScan()
  }, [startScan])

  const toggleSelect = useCallback((id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }, [])

  const selectAll = useCallback(() => {
    setItems((prev) => prev.map((item) => (item.exists && item.size > 0 ? { ...item, selected: true } : item)))
  }, [])

  const deselectAll = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })))
  }, [])

  const handleClean = useCallback(async () => {
    setShowConfirm(false)
    const selected = items.filter((i) => i.selected)
    if (!window.api || selected.length === 0) return
    const results = await window.api.cleanGlobalCaches(selected, dryRun)
    const totalFreed = results.reduce((s, r) => s + r.freedBytes, 0)
    setResult({ freed: totalFreed, isDryRun: dryRun })
    if (!dryRun) {
      setItems((prev) =>
        prev.map((item) => {
          const r = results.find((x) => x.id === item.id)
          if (!r || r.error) return item
          return { ...item, size: 0, exists: false, selected: false }
        })
      )
    }
  }, [items, dryRun])

  const selectedItems = items.filter((i) => i.selected)
  const totalSelectedSize = selectedItems.reduce((s, i) => s + i.size, 0)
  const totalSize = items.reduce((s, i) => s + i.size, 0)
  const allSelected = items.filter((i) => i.exists && i.size > 0).every((i) => i.selected)

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<CacheCategory, GlobalCacheItem[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat)
      return acc
    },
    { node: [], python: [], rust: [], java: [], system: [] }
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>{gc.title}</h1>
            <p>{gc.subtitle}</p>
          </div>
          <button
            className="btn-primary"
            onClick={startScan}
            disabled={scanState === 'scanning'}
            style={{ flexShrink: 0 }}
          >
            <IconRefresh />
            {scanState === 'scanning' ? gc.scanning : gc.scanButton}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {scanState === 'done' && items.length > 0 && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{items.filter((i) => i.exists).length}</span>
            <span className="stat-label">{gc.cachesFound}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value accent">{formatBytes(totalSize)}</span>
            <span className="stat-label">{gc.totalSize}</span>
          </div>
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div className={`result-banner ${result.isDryRun ? 'dry' : 'success'}`}>
          {result.isDryRun
            ? <><strong>{gc.dryRunDone}</strong> — {gc.wouldFree(formatBytes(result.freed))}</>
            : <><strong>{gc.cleanDone}</strong> — {gc.freedSpace(formatBytes(result.freed))}</>
          }
        </div>
      )}

      {/* Toolbar */}
      {scanState === 'done' && items.length > 0 && (
        <div className="table-toolbar">
          <span className="toolbar-count">{gc.entries(items.length)}</span>
          <button className="btn-text" onClick={allSelected ? deselectAll : selectAll}>
            <IconCheck />
            {allSelected ? gc.deselectAll : gc.selectAll}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="table-container">
        {scanState === 'scanning' ? (
          <div className="state-container">
            <div className="spinner" />
            <div className="progress-label">
              {progress ? `${progress.name} (${progress.current}/${progress.total})` : gc.scanning}
            </div>
            {progress && (
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '0 0 80px' }}>
            {CATEGORY_ORDER.map((cat) => {
              const catItems = grouped[cat]
              if (catItems.length === 0) return null
              const catLabel = tr.globalCaches.categories[cat]
              const catTotal = catItems.reduce((s, i) => s + i.size, 0)

              return (
                <div key={cat} className="cache-group">
                  <div className="cache-group-header">
                    <span className="cache-group-label">{catLabel}</span>
                    {catTotal > 0 && (
                      <span className="cache-group-size">{formatBytes(catTotal)}</span>
                    )}
                  </div>
                  {catItems.map((item) => (
                    <CacheRow
                      key={item.id}
                      item={item}
                      onToggle={toggleSelect}
                      notFoundLabel={gc.notFound}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action bar */}
      {selectedItems.length > 0 && (
        <div className="action-bar">
          <div className="action-bar-info">
            <strong>{selectedItems.length}</strong> {gc.cachesSelected}
            {totalSelectedSize > 0 && <> &mdash; <strong>{formatBytes(totalSelectedSize)}</strong> {gc.totalSize}</>}
          </div>
          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            <IconTrash />
            {gc.cleanSelected}
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{gc.confirmTitle}</div>
            <p className="modal-body">
              {gc.confirmText(selectedItems.length, formatBytes(totalSelectedSize))}
            </p>
            <div className="modal-toggle" onClick={() => setDryRun(!dryRun)}>
              <div className={`modal-toggle-track ${dryRun ? 'on' : ''}`}>
                <div className="modal-toggle-thumb" />
              </div>
              <span className="modal-toggle-label">{gc.dryRunLabel}</span>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                {gc.cancel}
              </button>
              <button className={`btn-confirm ${dryRun ? 'dry' : ''}`} onClick={handleClean}>
                {gc.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CacheRow ─────────────────────────────────────────────────────────────────

interface CacheRowProps {
  item: GlobalCacheItem
  onToggle: (id: string) => void
  notFoundLabel: string
}

function CacheRow({ item, onToggle, notFoundLabel }: CacheRowProps) {
  const disabled = !item.exists || item.size === 0

  return (
    <div
      className={`cache-row ${item.selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : () => onToggle(item.id)}
    >
      <div className="row-check">
        <div className={`check-box ${item.selected ? 'checked' : ''}`}>
          {item.selected && <CheckIcon />}
        </div>
      </div>
      <div className="cache-row-info">
        <div className="cache-row-name">{item.name}</div>
        <div className="cache-row-path">{item.path}</div>
      </div>
      <div className="cache-row-size">
        {!item.exists ? (
          <span className="cache-not-found">{notFoundLabel}</span>
        ) : (
          <span className={item.size === 0 ? 'row-size zero' : 'row-size'}>
            {formatBytes(item.size)}
          </span>
        )}
      </div>
    </div>
  )
}
