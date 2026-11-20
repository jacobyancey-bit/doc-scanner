# Privacy Policy for DocScanner

*Last Updated: November 8, 2026*

This Privacy Policy describes how **DocScanner** ("we", "us", or "our") handles user information.

## 1. On-Device & Privacy-First Architecture
DocScanner is designed as a privacy-first utility. All core operations, including document scanning, image edge detection, perspective cropping, and PDF compilation, occur **100% locally on your device**.

## 2. Information We Collect
We do **not** collect, store, sell, or transmit any personal information, documents, photos, or biometric data to external servers.

- **Camera Data**: Accessed strictly in real time to capture document pages you choose to scan. No camera frames or images are transmitted to us or any third party.
- **Storage / Files**: Scanned documents are stored in your device's private app directory and remain solely under your control.
- **Analytics & Tracking**: We do not use third-party advertising or invasive analytics tracking SDKs.

## 3. Web Synchronization (Optional)
If you explicitly choose to connect DocScanner with your browser session via QR code deep-link (`docscan://`), the selected document is transmitted directly to your requested web session callback endpoint using standard HTTPS encryption.

## 4. Permissions Used
- `android.permission.CAMERA`: Required to take photos of physical documents.
- `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`: Used to save and export generated PDF files to your device.
- `android.permission.INTERNET`: Used only if you initiate voluntary web transfer or share sheets.

## 5. Contact Us
If you have any questions about this Privacy Policy, please contact:
- Email: support@yourdomain.com
- Website: https://yourdomain.com

