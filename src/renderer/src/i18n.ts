export type Lang = 'tr' | 'en'

const translations = {
  tr: {
    appName: 'CleanDev',
    tabs: {
      deadProjects: 'Ölü Projeler',
      globalCaches: 'Global Önbellekler',
      classic: 'Klasik Temizlik'
    },
    deadProjects: {
      title: 'Ölü Proje Dedektörü',
      subtitle: 'Git geçmişine göre terk edilmiş projeleri bul ve alan kazan',
      selectFolder: 'Proje klasörü seç',
      selectedFolder: 'Seçili klasör',
      threshold: 'Hareketsizlik eşiği',
      thresholdDays: (d: number) => `${d} gün`,
      scanButton: 'Taramayı Başlat',
      scanning: 'Taranıyor...',
      discovering: 'Repolar keşfediliyor',
      analyzing: (name: string) => `Analiz ediliyor: ${name}`,
      noResults: 'Bu klasörde ölü proje bulunamadı.',
      noResultsHint: 'Eşik değerini düşürmeyi deneyin.',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Seçimi Kaldır',
      cleanSelected: (n: number, size: string) => `${n} Projeyi Temizle · ${size} kurtarılacak`,
      confirmTitle: 'Temizlemeyi Onayla',
      confirmText: (n: number, size: string) =>
        `${n} projeden ${size} disk alanı silinecek. Bu işlem geri alınamaz.`,
      dryRunLabel: 'Önce simüle et (önerilen)',
      dryRunNote: 'Simülasyon modunda hiçbir dosya silinmez.',
      confirm: 'Evet, Temizle',
      cancel: 'İptal',
      cleanDone: 'Temizlik Tamamlandı',
      freedSpace: (s: string) => `${s} alan kurtarıldı`,
      dryRunDone: 'Simülasyon Tamamlandı',
      wouldFree: (s: string) => `${s} alan kurtarılabilir`,
      lastCommit: 'Son commit',
      daysAgo: (d: number) => (d === 0 ? 'Hiç commit yok' : `${d} gün önce`),
      inactive: 'Hareketsiz',
      totalRecoverable: 'Kurtarılabilir',
      statsProjects: (n: number) => `${n} ölü proje`,
      statsRecoverable: (s: string) => `${s} kurtarılabilir`,
      columnName: 'Proje',
      columnType: 'Tür',
      projectsFound: (n: number) => `${n} proje bulundu`
    },
    globalCaches: {
      title: 'Global Önbellekler',
      subtitle: 'Paket yöneticisi önbelleklerini tara ve gereksiz alanı geri kazan',
      scanButton: 'Tara',
      scanning: 'Taranıyor...',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Seçimi Kaldır',
      cleanSelected: 'Seçilileri Temizle',
      confirmTitle: 'Önbellekleri Temizle',
      confirmText: (n: number, size: string) =>
        `${n} önbellek temizlenecek, ${size} alan kurtarılacak. Araçlar ihtiyaç duyduğunda yeniden indirir.`,
      dryRunLabel: 'Önce simüle et (önerilen)',
      confirm: 'Evet, Temizle',
      cancel: 'İptal',
      cleanDone: 'Temizlik Tamamlandı',
      freedSpace: (s: string) => `${s} alan kurtarıldı`,
      dryRunDone: 'Simülasyon Tamamlandı',
      wouldFree: (s: string) => `${s} alan kurtarılabilir`,
      notFound: 'Bulunamadı',
      cachesFound: 'önbellek bulundu',
      cachesSelected: 'önbellek seçildi',
      totalSize: 'toplam boyut',
      entries: (n: number) => `${n} giriş`,
      categories: {
        node: 'Node.js',
        python: 'Python',
        rust: 'Rust',
        java: 'Java / JVM',
        system: 'Sistem'
      }
    },
    classic: {
      macOsOnly: 'Bu özellik yalnızca macOS sistemlerde çalışır.',
      macOsOnlyHint: 'Lütfen bir macOS bilgisayarda çalıştırın.'
    },
    settings: {
      language: 'Dil',
      theme: 'Tema',
      dark: 'Koyu',
      light: 'Açık'
    }
  },
  en: {
    appName: 'CleanDev',
    tabs: {
      deadProjects: 'Dead Projects',
      globalCaches: 'Global Caches',
      classic: 'Classic Cleaner'
    },
    deadProjects: {
      title: 'Dead Project Detector',
      subtitle: 'Find abandoned projects by git inactivity and reclaim disk space',
      selectFolder: 'Select projects folder',
      selectedFolder: 'Selected folder',
      threshold: 'Inactivity threshold',
      thresholdDays: (d: number) => `${d} days`,
      scanButton: 'Start Scan',
      scanning: 'Scanning...',
      discovering: 'Discovering repos',
      analyzing: (name: string) => `Analyzing: ${name}`,
      noResults: 'No dead projects found in this folder.',
      noResultsHint: 'Try lowering the threshold.',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      cleanSelected: (n: number, size: string) => `Clean ${n} Projects · ${size} recoverable`,
      confirmTitle: 'Confirm Cleanup',
      confirmText: (n: number, size: string) =>
        `${size} of disk space will be deleted from ${n} project(s). This cannot be undone.`,
      dryRunLabel: 'Dry run first (recommended)',
      dryRunNote: 'In dry run mode, no files are deleted.',
      confirm: 'Yes, Clean',
      cancel: 'Cancel',
      cleanDone: 'Cleanup Complete',
      freedSpace: (s: string) => `${s} freed`,
      dryRunDone: 'Dry Run Complete',
      wouldFree: (s: string) => `${s} would be freed`,
      lastCommit: 'Last commit',
      daysAgo: (d: number) => (d === 0 ? 'No commits' : `${d} days ago`),
      inactive: 'Inactive',
      totalRecoverable: 'Recoverable',
      statsProjects: (n: number) => `${n} dead project${n !== 1 ? 's' : ''}`,
      statsRecoverable: (s: string) => `${s} recoverable`,
      columnName: 'Project',
      columnType: 'Type',
      projectsFound: (n: number) => `${n} project${n !== 1 ? 's' : ''} found`
    },
    globalCaches: {
      title: 'Global Caches',
      subtitle: 'Scan package manager caches and reclaim unnecessary disk space',
      scanButton: 'Scan',
      scanning: 'Scanning...',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      cleanSelected: 'Clean Selected',
      confirmTitle: 'Clean Caches',
      confirmText: (n: number, size: string) =>
        `${n} cache(s) will be cleaned, freeing ${size}. Tools will re-download when needed.`,
      dryRunLabel: 'Dry run first (recommended)',
      confirm: 'Yes, Clean',
      cancel: 'Cancel',
      cleanDone: 'Cleanup Complete',
      freedSpace: (s: string) => `${s} freed`,
      dryRunDone: 'Dry Run Complete',
      wouldFree: (s: string) => `${s} would be freed`,
      notFound: 'Not found',
      cachesFound: 'caches found',
      cachesSelected: 'caches selected',
      totalSize: 'total size',
      entries: (n: number) => `${n} ${n !== 1 ? 'entries' : 'entry'}`,
      categories: {
        node: 'Node.js',
        python: 'Python',
        rust: 'Rust',
        java: 'Java / JVM',
        system: 'System'
      }
    },
    classic: {
      macOsOnly: 'This feature only works on macOS systems.',
      macOsOnlyHint: 'Please run on a macOS computer.'
    },
    settings: {
      language: 'Language',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light'
    }
  }
} as const

export type Translations = (typeof translations)['tr']

export function t(lang: Lang): Translations {
  return translations[lang]
}
