import { useState, useEffect } from 'react'
import type { AppSettings } from '../../../../shared/types'
import type { Lang } from '../i18n'

const DEFAULT: AppSettings = {
  language: 'tr',
  theme: 'dark',
  lastProjectsPath: '',
  inactivityThresholdDays: 180
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!window.api) {
      setLoaded(true)
      applyTheme(DEFAULT.theme)
      return
    }
    window.api.getSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
      applyTheme(s.theme)
    })
  }, [])

  function applyTheme(theme: 'dark' | 'light') {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    if (!window.api) {
      setSettings((prev) => ({ ...prev, [key]: value }))
      if (key === 'theme') applyTheme(value as 'dark' | 'light')
      return
    }
    const updated = await window.api.setSetting(key, value)
    setSettings(updated)
    if (key === 'theme') applyTheme(value as 'dark' | 'light')
  }

  function setLanguage(lang: Lang) {
    updateSetting('language', lang)
  }

  function toggleTheme() {
    updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
  }

  return { settings, loaded, updateSetting, setLanguage, toggleTheme }
}
