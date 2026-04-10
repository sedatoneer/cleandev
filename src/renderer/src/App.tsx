import React, { useState, useEffect } from 'react'
import { useSettings } from './hooks/useSettings'
import { DeadProjectsTab } from './components/DeadProjects/DeadProjectsTab'
import { GlobalCachesTab } from './components/GlobalCaches/GlobalCachesTab'
import { ClassicCleaner } from './components/ClassicCleaner'
import { t, Lang } from './i18n'

type Tab = 'dead' | 'caches' | 'classic'

const IconScan = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="6.5" r="4" />
    <path d="M9.5 9.5L13 13" />
    <path d="M1 6.5h1M12 6.5h1M6.5 1v1M6.5 12v1" strokeWidth="1.2" />
  </svg>
)

const IconDatabase = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="8" cy="4.5" rx="5" ry="2" />
    <path d="M3 4.5v3c0 1.1 2.2 2 5 2s5-.9 5-2v-3" />
    <path d="M3 7.5v3c0 1.1 2.2 2 5 2s5-.9 5-2v-3" />
  </svg>
)

const IconWrench = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 2a3 3 0 0 1 0 5l-7 7-2-2 7-7A3 3 0 0 1 10.5 2z" />
  </svg>
)

const IconSun = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" strokeWidth="1.2" />
  </svg>
)

const IconMoon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z" />
  </svg>
)

const IconGlobe = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 2c-1.5 2-2.5 3.8-2.5 6s1 4 2.5 6M8 2c1.5 2 2.5 3.8 2.5 6s-1 4-2.5 6M2 8h12" />
  </svg>
)

const IconLogo = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L3 5v4c0 2.5 2 4.5 5 5 3-0.5 5-2.5 5-5V5L8 2z" />
    <path d="M6 8l1.5 1.5L10 6.5" />
  </svg>
)

export default function App() {
  const { settings, loaded, toggleTheme, setLanguage } = useSettings()
  const [activeTab, setActiveTab] = useState<Tab>('dead')

  const lang = (settings.language ?? 'tr') as Lang
  const tr = t(lang)

  useEffect(() => {
    document.documentElement.style.setProperty('--theme', settings.theme ?? 'dark')
  }, [settings.theme])

  if (!loaded) {
    return (
      <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <IconLogo />
          </div>
          <span className="sidebar-logo-name">
            Clean<span>Dev</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>

          <button
            className={`nav-item ${activeTab === 'dead' ? 'active' : ''}`}
            onClick={() => setActiveTab('dead')}
          >
            <span className="nav-item-icon"><IconScan /></span>
            {tr.tabs.deadProjects}
          </button>

          <button
            className={`nav-item ${activeTab === 'caches' ? 'active' : ''}`}
            onClick={() => setActiveTab('caches')}
          >
            <span className="nav-item-icon"><IconDatabase /></span>
            {tr.tabs.globalCaches}
          </button>

          <button
            className={`nav-item ${activeTab === 'classic' ? 'active' : ''}`}
            onClick={() => setActiveTab('classic')}
          >
            <span className="nav-item-icon"><IconWrench /></span>
            {tr.tabs.classic}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? tr.settings.light : tr.settings.dark}
          >
            {settings.theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <button className="lang-btn" onClick={() => setLanguage(lang === 'tr' ? 'en' : 'tr')}>
            <IconGlobe />
            {lang.toUpperCase()}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {activeTab === 'dead'    && <DeadProjectsTab lang={lang} tr={tr} />}
        {activeTab === 'caches'  && <GlobalCachesTab lang={lang} tr={tr} />}
        {activeTab === 'classic' && <ClassicCleaner tr={tr} />}
      </main>
    </div>
  )
}
