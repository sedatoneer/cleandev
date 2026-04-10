# CleanDev

**TR** | [EN](#english)

---

## Türkçe

### Nedir?

CleanDev, [Cleantr](https://github.com/truncgil/cleanup) projesinin bir fork'udur. Orijinal proje, macOS'ta gereksiz dosyaları temizleyen açık kaynaklı bir araçtır. Bu fork, orijinali temel alarak tamamen yeniden yazılmış ve geliştiricilere yönelik iki yeni özellik eklenmiştir.

### Orijinalden Farkları

Orijinal Cleantr kaynak kodunu incelerken iki sorun fark ettim:

1. Tarama motoru gerçek dosya sistemi okumak yerine `Math.random()` ile sahte boyutlar üretiyordu.
2. Uygulama yalnızca macOS ARM64 için derlenebiliyordu. Sorun evrensel, çözüm platform bağımsız olmalıydı.

Bunların yanı sıra geliştiricilerin yaygın yaşadığı ama mevcut hiçbir araçla çözülemeyen iki boşluk dikkatimi çekti: eski git projelerinde biriken build klasörleri ve paket yöneticilerinin global önbellekleri.

### Yeni Özellikler

#### Ölü Proje Dedektörü

Seçtiğin klasörü tarayarak terk edilmiş git repolarını tespit eder. Her repo için `git log` çalıştırır, son commit tarihine bakarak projenin aktif olup olmadığına karar verir. Bulunan projeler kurtarılabilir alan miktarına göre sıralanır. Silme işlemi yalnızca build klasörlerini etkiler; kaynak kod, git geçmişi ve proje dosyaları dokunulmaz kalır.

Desteklenen ekosistemler:

| Dil | Tespit | Silinen Klasörler |
|-----|--------|-------------------|
| Node.js | `package.json` | `node_modules`, `.next`, `.nuxt`, `dist`, `.turbo` |
| Python | `pyproject.toml` / `requirements.txt` | `.venv`, `__pycache__`, `.pytest_cache` |
| Rust | `Cargo.toml` | `target/` |
| Go | `go.mod` | `vendor/` |
| Java | `pom.xml` / `build.gradle` | `.gradle`, `build/`, `out/` |
| Flutter | `pubspec.yaml` | `.dart_tool/`, `build/` |
| Ruby | `Gemfile` | `vendor/bundle` |
| Elixir | `mix.exs` | `_build/`, `deps/` |
| .NET | `*.csproj` / `*.sln` | `bin/`, `obj/` |
| Swift | `Package.swift` | `.build/` |

#### Global Önbellek Tarayıcı

Paket yöneticilerinin global önbellek klasörlerini otomatik olarak bulur ve boyutlarını hesaplar. Klasör seçmene gerek yok; platform tespit edilerek doğru yollar otomatik belirlenir.

Taranan önbellekler: npm, pnpm, Bun, Yarn, pip, uv, Poetry, Cargo registry, Cargo git cache, Gradle, Maven local repository

#### Cross-Platform Destek

Orijinal uygulama yalnızca macOS ARM64 üzerinde çalışıyordu. CleanDev Windows, macOS ve Linux üzerinde çalışır. Ölü Proje Dedektörü ve Global Önbellek özellikleri her platformda tam işlevseldir.

### Kurulum ve Çalıştırma

```bash
git clone https://github.com/KULLANICI_ADIN/cleandev
cd cleandev
npm install
npm run dev
```

### Derleme

```bash
npm run build:win    # Windows — .exe
npm run build:mac    # macOS  — .dmg
npm run build:linux  # Linux  — .AppImage
```

Her `v*` etiket push'unda GitHub Actions üç platform için otomatik olarak derleyip release'e yükler.

### Teknik Yapı

- Electron + electron-vite
- React + TypeScript
- TailwindCSS
- Node.js `fs.promises` — tüm dosya sistemi işlemleri asenkron

### Katkı

Yeni bir ekosistem eklemek için `src/main/scanner.ts` dosyasındaki `CLEANABLE_FOLDERS` ve `TYPE_MANIFESTS` dizilerini güncelle, `src/shared/types.ts` dosyasına yeni tipi ekle.

Yeni bir global önbellek eklemek için `src/main/global-caches.ts` dosyasındaki tanım dizisine yeni giriş ekle.

---

## English

<a name="english"></a>

### What is it?

CleanDev is a fork of [Cleantr](https://github.com/truncgil/cleanup), an open-source macOS disk cleaner. This fork rewrites the application from scratch and adds two new developer-focused features.

### What changed from the original

While reading Cleantr's source code, I found two problems:

1. The scan engine generated fake file sizes using `Math.random()` instead of reading the actual filesystem.
2. The application only ran on macOS ARM64. The problem it solves is universal, the solution should be platform-independent.

Beyond fixing these, I noticed two gaps that no existing GUI tool addresses: build artifacts accumulating in abandoned git repositories, and global package manager caches silently growing across every language ecosystem.

### New Features

#### Dead Project Detector

Scans a folder you select for git repositories that have been abandoned. Runs `git log` on each repo, uses the last commit date to determine whether a project is still active, and presents results sorted by recoverable disk space. Deletion only removes build artifacts — source code, git history, and project files are never touched.

Supported ecosystems:

| Language | Detected by | Cleaned |
|----------|-------------|---------|
| Node.js | `package.json` | `node_modules`, `.next`, `.nuxt`, `dist`, `.turbo` |
| Python | `pyproject.toml` / `requirements.txt` | `.venv`, `__pycache__`, `.pytest_cache` |
| Rust | `Cargo.toml` | `target/` |
| Go | `go.mod` | `vendor/` |
| Java | `pom.xml` / `build.gradle` | `.gradle`, `build/`, `out/` |
| Flutter | `pubspec.yaml` | `.dart_tool/`, `build/` |
| Ruby | `Gemfile` | `vendor/bundle` |
| Elixir | `mix.exs` | `_build/`, `deps/` |
| .NET | `*.csproj` / `*.sln` | `bin/`, `obj/` |
| Swift | `Package.swift` | `.build/` |

#### Global Cache Scanner

Automatically locates and measures global package manager cache directories. No folder selection needed — paths are resolved per-platform at scan time.

Scanned caches: npm, pnpm, Bun, Yarn, pip, uv, Poetry, Cargo registry, Cargo git cache, Gradle, Maven local repository

#### Cross-Platform Support

The original application only ran on macOS ARM64. CleanDev runs on Windows, macOS, and Linux. The Dead Project Detector and Global Cache features are fully functional on all three platforms.

### Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/cleandev
cd cleandev
npm install
npm run dev
```

### Build

```bash
npm run build:win    # Windows — .exe installer
npm run build:mac    # macOS  — .dmg
npm run build:linux  # Linux  — .AppImage
```

GitHub Actions automatically builds all three platforms and uploads them to a release on every `v*` tag push.

### Tech Stack

- Electron + electron-vite
- React + TypeScript
- TailwindCSS
- Node.js `fs.promises` — all filesystem operations are non-blocking

### Contributing

To add a new ecosystem: update `CLEANABLE_FOLDERS` and `TYPE_MANIFESTS` in `src/main/scanner.ts`, and add the new type to `src/shared/types.ts`.

To add a new global cache entry: add a definition to the array in `src/main/global-caches.ts`.

---

Original project: [Cleantr by Umit Tunc](https://github.com/truncgil/cleanup) — MIT License.
This fork is also MIT licensed.
