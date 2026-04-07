const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Store = require('electron-store');
const bytes = require('bytes');
const os = require('os');
const fsExtra = require('fs-extra');

// Uygulama sürümü ve diğer bilgileri
const appVersion = app.getVersion();
const isDevMode = !app.isPackaged;

// App Store için MAS sürümü kontrolü
const isMAS = process.mas === true || process.argv.includes('--mas');

// App Store sürümünde log kayıtları
function logInfo(message) {
  if (isDevMode) {
    console.log(`[INFO] ${message}`);
  }
}

function logError(message, error) {
  if (isDevMode) {
    console.error(`[ERROR] ${message}`, error);
  }
}

// Ayarlar deposu
const store = new Store({
  name: 'preferences',
  defaults: {
    settings: {
      language: 'tr',
      darkMode: false,
      lastScan: null
    },
    bookmarks: {}
  }
});

// Dizin erişim izinleri için bookmark yönetimi
const bookmarks = store.get('bookmarks') || {};

let mainWindow;

// Ana pencereyi oluştur
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f5f5',
    icon: path.join(app.isPackaged ? process.resourcesPath : __dirname, '..', 'assets', 'icon.png')
  });

  // Geliştirici modunda geliştirici araçlarını aç
  if (isDevMode) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile('index.html');

  // Dış linkleri tarayıcıda aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Temizleme kurallarını oku
function readRules() {
  try {
    let rulesPath;
    if (app.isPackaged) {
      // Paketlenmiş uygulama için Resources klasöründen oku
      rulesPath = path.join(process.resourcesPath, 'scan-config.json');
    } else {
      // Geliştirme modu için proje kök dizininden oku
      rulesPath = path.join(__dirname, '..', 'scan-config.json');
    }

    logInfo(`Kurallar okunuyor: ${rulesPath}`);
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    const rules = JSON.parse(rulesContent);
    return rules;
  } catch (error) {
    logError('Kurallar okunamadı:', error);
    return [];
  }
}

// Dizin boyutunu hesapla - App Store uyumlu
function getDirSize(originalPath) {
  try {
    if (!originalPath || typeof originalPath !== 'string') {
      return 0;
    }
    const dirPath = resolveHome(originalPath);
    if (!fs.existsSync(dirPath) && !dirPath.includes('*')) {
      return 0;
    }

    if (isMAS) {
      // App Store sürümü için dosya boyutu hesaplama
      logInfo(`Dizin boyutu hesaplanıyor (MAS): ${dirPath}`);
      const size = getSizeRecursively(dirPath);
      return size;
    } else {
      // Normal sürüm için mevcut metod
      logInfo(`Dizin boyutu hesaplanıyor (normal): ${dirPath}`);
      // Wildcard expansion için shell kullanıyoruz
      const result = execSync(`du -sk ${dirPath} 2>/dev/null || echo "0"`, { encoding: 'utf8' });
      // du birden fazla satır döndürebilir (wildcard durumunda), toplayalım
      const lines = result.trim().split('\n');
      let totalSize = 0;
      for (const line of lines) {
        const sizeKB = parseInt(line.split('\t')[0]);
        if (!isNaN(sizeKB)) {
          totalSize += sizeKB * 1024;
        }
      }
      return totalSize;
    }
  } catch (error) {
    logError(`Dizin boyutu hesaplanamadı: ${originalPath}`, error);
    return 0;
  }
}

// App Store için rekürsif boyut hesaplama
function getSizeRecursively(dirPath) {
  let totalSize = 0;
  try {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        try {
          const stats = fs.statSync(itemPath);

          if (stats.isFile()) {
            totalSize += stats.size;
          } else if (stats.isDirectory()) {
            totalSize += getSizeRecursively(itemPath);
          }
        } catch (statError) {
          logError(`İstatistik okunamadı: ${itemPath}`, statError);
        }
      }
    }
  } catch (error) {
    logError(`Boyut hesaplama hatası: ${dirPath}`, error);
  }
  return totalSize;
}

// App Store için dosya erişimi
async function requestBookmarkForPath(filePath) {
  if (!isMAS) {
    return true;
  }

  // Daha önce kaydedilmiş bir bookmark varsa onu kullan
  if (bookmarks[filePath]) {
    logInfo(`Kaydedilmiş bookmark kullanılıyor: ${filePath}`);
    return true;
  }

  try {
    // Kullanıcıdan klasör erişimi izni iste
    logInfo(`Klasör erişim izni isteniyor: ${filePath}`);
    const result = await dialog.showOpenDialog({
      title: 'Klasöre erişim izni verin',
      message: `"${filePath}" klasörüne erişim izni gerekiyor`,
      buttonLabel: 'İzin Ver',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
      logInfo(`Kullanıcı erişim izni vermedi: ${filePath}`);
      return false;
    }

    // Seçilen klasörü bookmark olarak kaydet
    const selectedPath = result.filePaths[0];
    logInfo(`Bookmark kaydediliyor: ${filePath} -> ${selectedPath}`);
    bookmarks[filePath] = selectedPath;
    store.set(`bookmarks.${filePath}`, selectedPath);

    return true;
  } catch (error) {
    logError(`Klasör erişim izni alınamadı: ${filePath}`, error);
    return false;
  }
}

// ~ işaretini ev dizini ile değiştiren fonksiyon
function resolveHome(filepath) {
  if (!filepath || typeof filepath !== 'string') {
    return filepath;
  }
  if (filepath.startsWith('~')) {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

// Dizin içeriğini temizleyen fonksiyon
async function cleanDirectoryContents(dirPath) {
  const resolvedPath = resolveHome(dirPath);
  if (!fs.existsSync(resolvedPath)) {
    logInfo(`Temizlenecek dizin bulunamadı: ${resolvedPath}`);
    return;
  }

  // App Store sürümü için izin kontrolü
  if (isMAS) {
    const hasPermission = await requestBookmarkForPath(resolvedPath);
    if (!hasPermission) {
      throw new Error(`"${dirPath}" için erişim izni alınamadı`);
    }
  }

  logInfo(`Dizin temizleniyor: ${resolvedPath}`);

  // Dizin içeriğini oku ve sil
  fs.readdirSync(resolvedPath).forEach(file => {
    const fullPath = path.join(resolvedPath, file);
    try {
      if (isMAS) {
        fsExtra.removeSync(fullPath);
      } else {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
      logInfo(`Silindi: ${fullPath}`);
    } catch (err) {
      logError(`Silinemedi: ${fullPath}`, err);
    }
  });
}

// Geriye uyumluluk için eski cleanDirectory fonksiyonu
async function cleanDirectory(dirPath) {
  try {
    await cleanDirectoryContents(dirPath);
    return { success: true };
  } catch (error) {
    logError(`Temizleme hatası: ${dirPath}`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// IPC Olayları
ipcMain.handle('get-settings', () => {
  return store.get('settings');
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('get-rules', () => {
  return readRules();
});

ipcMain.handle('scan-directories', async (event, rules) => {
  const results = [];
  logInfo('Dizin tarama başladı');

  for (const rule of rules) {
    try {
      const expandedPath = rule.path.replace(/^~/, os.homedir());
      const resolvedPath = path.resolve(expandedPath);

      if (fs.existsSync(resolvedPath)) {
        // App Store sürümü için izin kontrolü
        if (isMAS) {
          const hasPermission = await requestBookmarkForPath(resolvedPath);
          if (!hasPermission) {
            logInfo(`"${rule.path}" için erişim izni alınamadı, atlıyorum`);
            continue;
          }
        }

        const size = getDirSize(resolvedPath);

        results.push({
          id: rule.id,
          name: rule.name,
          path: resolvedPath,
          size: size,
          selected: rule.selected
        });
      }
    } catch (error) {
      logError(`Tarama hatası: ${rule.id}`, error);
    }
  }

  store.set('settings.lastScan', new Date().toISOString());
  logInfo('Dizin tarama tamamlandı');
  return results;
});

ipcMain.handle('clean-directories', async (event, paths) => {
  logInfo(`Temizleme başlıyor: ${paths.length} dizin`);
  const results = [];

  for (const dirPath of paths) {
    try {
      const result = await cleanDirectory(dirPath);
      results.push({
        path: dirPath,
        success: result.success,
        error: result.error
      });
    } catch (error) {
      logError(`Temizleme hatası: ${dirPath}`, error);
      results.push({
        path: dirPath,
        success: false,
        error: error.message
      });
    }
  }

  return results;
});

ipcMain.handle('remove-directory', async (event, dirPath) => {
  try {
    logInfo(`Dizin siliniyor: ${dirPath}`);
    await cleanDirectory(dirPath);
    return { success: true };
  } catch (error) {
    logError(`Dizin silme hatası: ${dirPath}`, error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('get-folder-size', (event, folderPath) => {
  logInfo(`Klasör boyutu alınıyor: ${folderPath}`);
  const size = getDirSize(folderPath);
  return size;
});

ipcMain.handle('format-bytes', (event, size) => {
  return bytes(size);
});

ipcMain.handle('openInFinder', (event, folderPath) => {
  logInfo(`Finder'da açılıyor: ${folderPath}`);
  shell.showItemInFolder(folderPath);
  return true;
});

ipcMain.handle('execute-command', async (event, command) => {
  try {
    const resolvedCommand = command.replace(/^~/, os.homedir());
    logInfo(`Komut çalıştırılıyor: ${resolvedCommand}`);
    const output = execSync(resolvedCommand, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    logError(`Komut çalıştırma hatası: ${command}`, error);
    return {
      success: false,
      error: error.message,
      stderr: error.stderr ? error.stderr.toString() : ''
    };
  }
});

// Disk bilgilerini döndür
ipcMain.handle('get-disk-info', async () => {
  try {
    // macOS için df -k / komutunu kullanıyoruz
    const output = execSync('df -k / | tail -1', { encoding: 'utf8' });
    const parts = output.trim().split(/\s+/);
    // df output: Filesystem 1024-blocks Used Available Capacity Mounted on
    // parts[1] = total, parts[2] = used, parts[3] = available
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    const available = parseInt(parts[3]) * 1024;
    const percent = Math.round((used / total) * 100);

    return {
      success: true,
      total,
      used,
      available,
      percent
    };
  } catch (error) {
    logError('Disk bilgisi alınamadı:', error);
    return { success: false, error: error.message };
  }
});

// Uygulama bilgilerini döndür
ipcMain.handle('get-app-info', () => {
  return {
    version: appVersion,
    isMAS: isMAS,
    isDevMode: isDevMode
  };
}); 