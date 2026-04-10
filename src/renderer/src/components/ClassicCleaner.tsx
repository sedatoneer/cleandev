import React, { useEffect, useState } from 'react'
import { Translations } from '../i18n'

const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c1.5-1.5 4-2 5.5-.5C19 7 18.5 9 17 10.5c-1.5 1.5-4 2-5.5.5" />
    <path d="M6 9c-2 2-2.5 5-1 7.5C6.5 19.5 9 21 11 20c.8-.4 1.5-.5 2-.5s1.2.1 2 .5c2 1 4.5-.5 6-3.5 1-1.8 1-3.5.2-5" />
  </svg>
)

interface Props {
  tr: Translations
}

export function ClassicCleaner({ tr }: Props) {
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    if (!window.api) { setPlatform('browser'); return }
    window.api.getPlatform().then(setPlatform)
  }, [])

  if (!platform) {
    return (
      <div className="notice-card">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="notice-card">
      <div className="notice-icon-wrap">
        <IconApple />
      </div>
      <div className="notice-title">{tr.classic.macOsOnly}</div>
      <div className="notice-subtitle">{tr.classic.macOsOnlyHint}</div>
      <div className="notice-platform">platform: {platform}</div>
    </div>
  )
}
