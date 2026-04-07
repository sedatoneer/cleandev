const { notarize } = require('electron-notarize');
const path = require('path');
const fs = require('fs');

// Notarize işlemi için gerekli fonksiyon
exports.default = async function notarizing(context) {
  // MAS (Mac App Store) derlemesi için notarize adımını atla
  if (process.env.IS_MAS === 'true') {
    console.log('Mac App Store yapısı için notarize adımı atlanıyor');
    return;
  }

  // Normal macOS derlemesi için notarize işlemine devam et
  console.log('Notarize süreci başlatılıyor...');

  // Notarize adımı için çevre değişkenlerini kontrol et
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    console.log('macOS dışı platform, notarize adımı atlanıyor');
    return;
  }

  // Notarize için gerekli bilgileri kontrol et
  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);
  
  if (!fs.existsSync(appPath)) {
    console.error(`Notarize için uygulama bulunamadı: ${appPath}`);
    return;
  }

  // Apple Developer kimlik bilgilerini al
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID || '3W8Z9FGZ63';

  if (!appleId || !appleIdPassword) {
    console.warn('Apple ID veya şifre eksik, notarize adımı atlanıyor');
    console.warn('Notarize işlemi için çevre değişkenlerini ayarlayın:');
    console.warn('APPLE_ID, APPLE_ID_PASSWORD ve opsiyonel olarak APPLE_TEAM_ID');
    return;
  }

  // Notarize işlemini başlat
  console.log(`Notarize işlemi başlatılıyor: ${appName}`);
  
  try {
    await notarize({
      appBundleId: 'com.truncgil.cleantr',
      appPath,
      appleId,
      appleIdPassword,
      teamId
    });
    console.log(`Notarize işlemi tamamlandı: ${appName}`);
  } catch (error) {
    console.error(`Notarize işlemi başarısız: ${error.message}`);
    throw error;
  }
}; 