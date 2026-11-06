# DocScanner (Android & Web-Integrated)

A lightweight, privacy-first Document Scanner and PDF utility built to unbundle overpriced scanner apps ($60–$70/yr) like CamScanner and Adobe Scan.

## 🌟 Key Features
- **Android ML Kit Camera**: Automatic edge detection, perspective warping, and shadow removal.
- **100% On-Device & Private**: Zero server processing required. Scanned documents never leave the device unless explicitly shared.
- **Client-Side PDF Engine**: Uses `pdf-lib` to stitch multi-page PDFs instantly.
- **Website Deep-Link & QR Pairing**: Open app directly from your website to scan documents straight into a desktop browser session.
- **Native Android Share Sheet**: One-tap share to Google Drive, WhatsApp, Email, or local storage.

---

## 🚀 Running on Android

### 1. Install Dependencies
```powershell
cd C:\Users\jacob\Projects\doc-scanner
npm install
node scripts/generate-assets.js
```

### 2. Prebuild Android Native Files
Because this app uses Android's ML Kit native scanner activity, generate the native code via:
```powershell
npx expo prebuild --platform android
```

### 3. Launch App
```powershell
npm run android
```

---

## 🌐 Website Integration
See [WEBSITE_INTEGRATION.md](./WEBSITE_INTEGRATION.md) for how to:
- Show a QR code on your website to launch the app directly.
- Receive scanned PDFs on your website in real-time.
- Share PDF manipulation code between mobile and your web frontend.

