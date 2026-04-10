import React, { useState } from 'react'
import { ScannedProject, ProjectType } from '../../../../../shared/types'
import { Translations } from '../../i18n'

const TYPE_LABEL: Record<ProjectType, string> = {
  node:    'Node.js',
  python:  'Python',
  rust:    'Rust',
  go:      'Go',
  java:    'Java',
  flutter: 'Flutter',
  ruby:    'Ruby',
  elixir:  'Elixir',
  dotnet:  '.NET',
  swift:   'Swift',
  unknown: 'Unknown'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function inactivityClass(days: number): string {
  if (days > 365) return 'row-inactive stale'
  if (days > 180) return 'row-inactive aging'
  return 'row-inactive idle'
}

function formatInactive(days: number, tr: Translations['deadProjects']): string {
  return tr.daysAgo(days)
}

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 2.5L7.5 6l-3 3.5" />
  </svg>
)

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.5L6 7.5l3.5-3" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 5.5l2.5 2.5 4.5-5" />
  </svg>
)

interface Props {
  project: ScannedProject
  onToggle: (id: string) => void
  tr: Translations['deadProjects']
}

export function ProjectCard({ project, onToggle, tr }: Props) {
  const [expanded, setExpanded] = useState(false)
  const noCleanable = project.totalCleanableSize === 0

  function handleRowClick(e: React.MouseEvent) {
    // Click anywhere on row to select; chevron area toggles expand
    onToggle(project.id)
  }

  function handleExpandClick(e: React.MouseEvent) {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <div className="project-row-wrap">
      <div
        className={`project-row ${project.isSelected ? 'selected' : ''} ${noCleanable ? 'opacity-50' : ''}`}
        onClick={noCleanable ? undefined : handleRowClick}
        style={{ cursor: noCleanable ? 'default' : 'pointer' }}
      >
        {/* Checkbox */}
        <div className="row-check" onClick={noCleanable ? undefined : handleRowClick}>
          <div className={`check-box ${project.isSelected ? 'checked' : ''}`}>
            {project.isSelected && <CheckIcon />}
          </div>
        </div>

        {/* Name */}
        <div className="row-name">
          <div className="row-name-primary">{project.name}</div>
          <div className="row-name-secondary">{project.rootPath}</div>
        </div>

        {/* Type */}
        <div>
          <span className={`type-badge type-${project.projectType}`}>
            {TYPE_LABEL[project.projectType]}
          </span>
        </div>

        {/* Inactive */}
        <div className={inactivityClass(project.daysInactive)}>
          {formatInactive(project.daysInactive, tr)}
        </div>

        {/* Size + expand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <span className={`row-size ${noCleanable ? 'zero' : ''}`}>
            {formatBytes(project.totalCleanableSize)}
          </span>
          {project.cleanableFolders.length > 0 && (
            <button
              className="icon-btn"
              style={{ width: '20px', height: '20px', flexShrink: 0 }}
              onClick={handleExpandClick}
              title={expanded ? 'Collapse' : 'Expand folders'}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded folder detail */}
      {expanded && project.cleanableFolders.length > 0 && (
        <div className="row-expanded">
          <div className="expanded-folders">
            {project.cleanableFolders.map((folder) => (
              <div key={folder.path} className="folder-item">
                <span className="folder-label">{folder.label}</span>
                <span className="folder-size">{formatBytes(folder.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
