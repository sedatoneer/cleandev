#!/bin/bash

# CleanTR - Mac App Store Build Script
# Bu script, CleanTR uygulamasını Mac App Store için derler

# Hata durumunda betik çalışmayı durdursun
set -e

# Renkli çıktılar için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Başlık göster
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      CleanTR - Mac App Store Build Script          ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Çevre değişkenlerini kontrol et
if [ -z "$APPLE_ID" ]; then
  echo -e "${RED}HATA: APPLE_ID çevre değişkeni tanımlanmamış${NC}"
  echo -e "${YELLOW}Lütfen aşağıdaki çevre değişkenlerini tanımlayın:${NC}"
  echo -e "export APPLE_ID=\"your.email@example.com\""
  echo -e "export APPLE_ID_PASSWORD=\"app-specific-password\""
  echo -e "export APPLE_TEAM_ID=\"3W8Z9FGZ63\" # Team ID'niz"
  exit 1
fi

if [ -z "$APPLE_ID_PASSWORD" ]; then
  echo -e "${RED}HATA: APPLE_ID_PASSWORD çevre değişkeni tanımlanmamış${NC}"
  echo -e "${YELLOW}App-specific şifre oluşturmak için: https://appleid.apple.com/account/manage${NC}"
  exit 1
fi

# Team ID'yi kontrol et
TEAM_ID=${APPLE_TEAM_ID:-"3W8Z9FGZ63"}
echo -e "${GREEN}Team ID: ${TEAM_ID}${NC}"

# Geçerli uygulama sürümünü package.json'dan al
VERSION=$(node -e "console.log(require('./package.json').version)")
echo -e "${GREEN}Uygulama Sürümü: ${VERSION}${NC}"

# Gerekli dizinleri kontrol et
if [ ! -f "build/entitlements.mas.plist" ]; then
  echo -e "${RED}HATA: build/entitlements.mas.plist dosyası bulunamadı${NC}"
  exit 1
fi

if [ ! -f "build/embedded.provisionprofile" ]; then
  echo -e "${RED}HATA: build/embedded.provisionprofile dosyası bulunamadı${NC}"
  echo -e "${YELLOW}Provizyon profilini Apple Developer hesabınızdan indirip 'build' klasörüne yerleştirin${NC}"
  exit 1
fi

# Bağımlılıkları güncelle
echo -e "${BLUE}Bağımlılıklar güncelleniyor...${NC}"
npm install

# Temizleme
echo -e "${BLUE}Önceki derlemeler temizleniyor...${NC}"
rm -rf dist/*

# Derleme işlemi
echo -e "${BLUE}Mac App Store için derleme başlatılıyor...${NC}"
CSC_NAME="$(node -e "console.log(require('./package.json').author.name)") (${TEAM_ID})" \
CSC_INSTALLER_NAME="$(node -e "console.log(require('./package.json').author.name)") (${TEAM_ID})" \
IS_MAS=true \
npm run build-mas

# Kontrol
if [ -f "dist/CleanTR-${VERSION}-mas.pkg" ]; then
  echo -e "${GREEN}Derleme başarılı!${NC}"
  echo -e "${GREEN}Çıktı: dist/CleanTR-${VERSION}-mas.pkg${NC}"
  echo -e "${BLUE}====================================================${NC}"
  echo -e "${YELLOW}Sonraki adımlar:${NC}"
  echo -e "${YELLOW}1. Transporter uygulamasını kullanarak .pkg dosyasını App Store Connect'e yükleyin${NC}"
  echo -e "${YELLOW}2. App Store Connect'te gerekli meta verileri doldurun${NC}"
  echo -e "${YELLOW}3. Uygulamayı inceleme için gönderin${NC}"
  echo -e "${BLUE}====================================================${NC}"
else
  echo -e "${RED}HATA: Derleme başarısız oldu!${NC}"
  exit 1
fi 