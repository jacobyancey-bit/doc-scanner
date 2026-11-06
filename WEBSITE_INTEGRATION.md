# Website Integration Guide: DocScanner

This guide demonstrates how your website and the `doc-scanner` Android app connect with **zero server storage costs**.

---

## 1. Deep Link / QR Code Pairing

On your website, you can show a button or a QR code for desktop visitors:
*"Scan pages directly with your phone"*

### QR Code URL Format:
```text
docscan://scan?session=<UNIQUE_SESSION_ID>&callback=https://yourwebsite.com/api/scanner/upload
```

When a user scans this QR code with their phone camera (or clicks a link on mobile):
1. Android automatically opens the `DocScanner` app via its custom scheme (`docscan://`).
2. The app captures `session` and `callback`.
3. When the user finishes scanning, the app packages the PDF and POSTs it directly to your website callback URL.

---

## 2. Next.js / Node.js Webhook Endpoint Example

Create an endpoint on your website (e.g. `/api/scanner/upload` in Next.js / Express):

```typescript
// pages/api/scanner/upload.ts or app/api/scanner/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { sessionId, title, pdfBase64, timestamp } = await req.json();

  // 1. Broadcast the incoming PDF to the active browser session
  // (using WebSockets, Server-Sent Events, or Supabase Realtime channel)
  await broadcastToBrowserSession(sessionId, {
    title,
    pdfBase64,
    timestamp,
  });

  return NextResponse.json({ success: true });
}
```

---

## 3. Reusing the PDF Code in the Browser

Because the mobile app uses **`pdf-lib`** (100% pure JavaScript), you can use the exact same logic on your website:

```typescript
import { PDFDocument } from 'pdf-lib';

// Merge two PDFs directly in the user's web browser:
export async function mergePDFsInBrowser(pdfBytesA: Uint8Array, pdfBytesB: Uint8Array) {
  const docA = await PDFDocument.load(pdfBytesA);
  const docB = await PDFDocument.load(pdfBytesB);

  const mergedDoc = await PDFDocument.create();

  const pagesA = await mergedDoc.copyPages(docA, docA.getPageIndices());
  pagesA.forEach((page) => mergedDoc.addPage(page));

  const pagesB = await mergedDoc.copyPages(docB, docB.getPageIndices());
  pagesB.forEach((page) => mergedDoc.addPage(page));

  return await mergedDoc.save();
}
```

---

## 4. Monetization & Funnel Flow

```text
Visitor on Website                    Mobile App
─────────────────                    ──────────
1. Uses free browser tool  ───┐
   (e.g., PDF viewer/merge)   │
                              ├─────► 3. Downloads Android app
2. Clicks "Scan from Phone" ──┘          from Google Play link
   (displays QR code)
                                      4. Scans physical documents
                                         with auto edge detection
                                         & shadow removal
                                      
                                      5. Optionally unlocks $4.99
                                         lifetime pass or syncs to web
```

