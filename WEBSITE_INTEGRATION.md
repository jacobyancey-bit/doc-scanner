# Website Integration & API Guide: DocScanner

**Developer:** Dangling Dice Studios™  
**Production Domain:** `https://dangling-dice-studios.com`  
**Security Model:** Strict Origin Whitelist • Zero Server Retention • $0 Egress  

---

## 1. Deep Link / QR Code Pairing

On `dangling-dice-studios.com`, display a QR code for desktop users:
*"Scan pages directly with your phone camera"*

### QR Code URL Format:
```text
docscan://scan?session=<UNIQUE_SESSION_ID>&callback=https://dangling-dice-studios.com/api/scanner/upload
```

> **Security Guard:** The mobile app's `DeepLinkService` strictly validates the callback origin against `*.dangling-dice-studios.com`. Untrusted or third-party callback URLs are automatically rejected to prevent SSRF and document exfiltration.

---

## 2. Secure Webhook Endpoint (Next.js App Router)

Create this endpoint on `dangling-dice-studios.com` (`app/api/scanner/upload/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // DoS Payload Cap
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const correlationId = req.headers.get('x-request-id') || `req_${Date.now()}`;
    const clientApp = req.headers.get('x-client-app');

    if (clientApp !== 'DocScan-Android') {
      return NextResponse.json({ error: 'Unauthorized client' }, { status: 403 });
    }

    const { sessionId, title, pdfBase64, timestamp } = await req.json();

    if (!sessionId || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required payload parameters' }, { status: 400 });
    }

    // Zero-Retention Broadcast: Send in-memory to active browser WebSocket/SSE
    // Documents are NEVER written to disk or permanent databases!
    await broadcastToBrowserSession(sessionId, {
      title,
      pdfBase64,
      timestamp,
      correlationId,
    });

    return NextResponse.json({ success: true, correlationId });
  } catch (err) {
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
  }
}
```

---

## 3. OpenAPI 3.0.3 Specification

```yaml
openapi: 3.0.3
info:
  title: Dangling Dice Studios DocScanner Web Bridge API
  version: 1.0.0
  description: Ephemeral, zero-retention webhook for receiving on-device scanned documents.
paths:
  /api/scanner/upload:
    post:
      summary: Upload scanned PDF to desktop session
      parameters:
        - name: X-Request-Id
          in: header
          required: false
          schema:
            type: string
        - name: X-Client-App
          in: header
          required: true
          schema:
            type: string
            example: DocScan-Android
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - sessionId
                - title
                - pdfBase64
                - timestamp
              properties:
                sessionId:
                  type: string
                  example: sess_98f12a
                title:
                  type: string
                  example: Receipt_2026-11-26
                pdfBase64:
                  type: string
                  format: byte
                  description: Standard Base64 encoded PDF binary
                timestamp:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Document successfully dispatched to browser session in-memory
        '400':
          description: Invalid payload or missing parameters
        '403':
          description: Forbidden client
```

---

## 4. Machine-Readable Compliance Endpoint (`/api/compliance`)

Deploy this route on `dangling-dice-studios.com/api/compliance` to satisfy Pillar 8 audit standards:

```json
{
  "developer": "Dangling Dice Studios",
  "application": "DocScan: PDF Document Scanner",
  "privacyPolicyUrl": "https://dangling-dice-studios.com/privacy",
  "termsOfServiceUrl": "https://dangling-dice-studios.com/terms",
  "zeroRetention": {
    "enabled": true,
    "onDeviceProcessing": true,
    "cloudStorageOfDocuments": false,
    "telemetryTracking": false
  },
  "compliance": ["GDPR", "CCPA", "Google Play Data Safety"]
}
```

---

## 5. Schema.org JSON-LD for Landing Page

Embed this inside the `<head>` of `https://dangling-dice-studios.com/doc-scanner`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DocScan: PDF Document Scanner",
  "operatingSystem": "Android",
  "applicationCategory": "ProductivityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Dangling Dice Studios",
    "url": "https://dangling-dice-studios.com"
  },
  "description": "Fast, privacy-first Android document scanner with auto edge detection, shadow removal, and client-side PDF creation. 100% on-device with zero server retention."
}
</script>
```
