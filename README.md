# CleanTR - macOS Geliştirici Temizlik Uygulaması

CleanTR, macOS geliştiricileri için disk temizleme uygulamasıdır. Geliştirme ortamınızı temiz tutmak için gereksiz dosyaları ve önbellekleri kolayca tespit edip temizlemenize yardımcı olur.

![CleanTR Screenshot](assets/ss/screenshot.png)

## Özellikler

- Xcode türev verileri, arşivler ve cihaz desteği dosyalarını temizleme
- iOS Simulator ve Android Emülatör dosyalarını temizleme
- Flutter build çıktıları ve npm/yarn önbelleklerini temizleme
- Kolay kullanımlı arayüz
- Koyu tema desteği
- Türkçe ve İngilizce dil desteği
- macOS sandbox uyumlu

## Kullanım

1. Temizlemek istediğiniz öğeleri seçin
2. "Tara" düğmesine tıklayın
3. Sonuçları gözden geçirin
4. "Temizle" düğmesine tıklayarak seçili öğeleri temizleyin

## Geliştirme

### Gereksinimler

- Node.js 14 veya üzeri
- npm veya yarn
- Electron

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/yourusername/cleantr.git
cd cleantr

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

### Derleme

```bash
# macOS için derleme
npm run build-mac

# Mac App Store için derleme
npm run build-mas
```

## App Store'da Yayınlama

CleanTR'ı Mac App Store'da yayınlamak için aşağıdaki adımları izleyin:

### 1. Gerekli Sertifikalar ve Profiller

Apple Developer hesabınızdan aşağıdaki sertifikaları oluşturun:

- Mac App Distribution
- Mac Installer Distribution
- Mac Development (geliştirme için)

### 2. Uygulama Kimliği Oluşturma

1. [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)'da yeni bir App ID oluşturun
2. Bundle ID'yi `com.yourusername.cleantr` şeklinde ayarlayın
3. Gerekli özellikleri etkinleştirin (App Sandbox gereklidir)

### 3. Provizyon Profili Oluşturma

1. Mac App Store Distribution için bir provizyon profili oluşturun
2. Oluşturulan profili indirip çift tıklayarak yükleyin
3. Profili `build/embedded.provisionprofile` konumuna kopyalayın

### 4. App Store Connect'te Uygulama Oluşturma

1. [App Store Connect](https://appstoreconnect.apple.com)'e gidin
2. "+" düğmesine tıklayarak yeni bir uygulama oluşturun
3. Platform olarak macOS'u seçin
4. Bundle ID, isim ve diğer bilgileri girin

### 5. Uygulama Varlıklarını Hazırlama

Aşağıdaki varlıkları App Store Connect'e yükleyin:

1. Uygulama simgeleri (1024x1024 dahil tüm boyutlar)
2. Ekran görüntüleri (çeşitli boyutlar)
3. Uygulama açıklaması ve anahtar kelimeler

### 6. Derleme ve İmzalama

1. Çevre değişkenlerini ayarlayın:

```bash
export APPLE_ID="your.email@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="3W8Z9FGZ63" # Bu sertifikalarınızdaki Team ID
```

2. App Store paketi oluşturun:

```bash
npm run build-mas
```

3. Oluşturulan paketi kontrol edin: `dist/CleanTR-1.0.1-mas.pkg`

### 7. App Store Connect'e Yükleme

1. [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) uygulamasını kullanarak oluşturulan .pkg dosyasını yükleyin
2. App Store Connect'te paket işleme tamamlandığında, uygulamanın "Build" bölümünde görünecektir

### 8. İnceleme için Gönderme

1. App Store Connect'te tüm meta verileri ve ekran görüntülerini tamamlayın
2. Test notlarını ve iletişim bilgilerini ekleyin
3. "Submit for Review" düğmesine tıklayın

### Önemli Notlar

- App Store incelemeleri genellikle 1-3 gün sürer
- Sandbox izinleri doğru yapılandırılmalıdır
- Kullanıcıdan dosya/klasör seçmesi için standart açık/kaydet iletişim kutularını kullanın
- Uygulamanın kullanıcı verilerini nasıl kullandığını açıklayan bir gizlilik politikası gereklidir

## Katkıda Bulunma

1. Bu depoyu forklayın
2. Özellik dalınızı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Ümit Tunç - [@umittnc](https://twitter.com/umittnc) - hello@umittunc.org

Proje Linki: [https://github.com/umittnc/cleantr](https://github.com/umittnc/cleantr) 