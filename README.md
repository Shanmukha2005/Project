# ShareFlow

ShareFlow is now a working browser-based MVP for instant file sharing, retrieval-code downloads, tab-to-tab live sharing, clipboard broadcast, and conversion workflows.

## What Works Today

- Upload one or many files directly in the browser by choosing files or dragging them into the upload drop zone.
- Store uploaded files in IndexedDB so they remain available after refresh on the same browser/device.
- Generate six-character retrieval codes for every uploaded file.
- Retrieve files by code, preview images/video/audio/PDF files when the browser supports it, download files, copy codes, copy share links, and delete stored files.
- Generate QR-code images for retrieval links using the public QR Server image endpoint.
- Create or join live sessions by six-character session code with visible online/offline status.
- Send files and clipboard text live between tabs on the same origin with `BroadcastChannel`, then download received live files from the live inbox.
- Run real in-browser image conversions for PNG, JPG/JPEG, and WebP through Canvas.
- Extract text for plain text-compatible files where the browser can read the input.
- Produce downloadable backend job manifests for heavy Office, PDF, video, audio, OCR, ebook, and archive conversions.

## Why Some Conversions Use Job Manifests

A browser-only static app cannot safely or reliably run LibreOffice, FFmpeg, Poppler, Ghostscript, Tesseract OCR, Pandoc, or pdfcpu. The UI therefore captures every requested conversion and downloads a JSON job manifest for conversions that need a backend worker. Production support for all formats should add Node.js APIs and worker containers that execute those tools.

## Run Locally

```bash
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173/index.html>.

## Production Architecture

```text
ShareFlow
├── Static/React frontend
│   ├── Upload + retrieval-code UI
│   ├── QR retrieval links
│   ├── Live sharing UI
│   └── Converter UI
├── Node.js + Express API
│   ├── Upload/retrieve REST endpoints
│   ├── Conversion job endpoints
│   └── Socket.IO WebRTC signaling
├── MongoDB metadata
├── AWS S3 or local object storage
└── Worker containers
    ├── LibreOffice
    ├── FFmpeg
    ├── Poppler/Ghostscript
    ├── Tesseract OCR
    ├── Pandoc
    └── pdfcpu/PDF-lib
```

## Current Frontend Scope

The app is intentionally realistic about what can run without a backend: local uploads, retrieval, previews, downloads, QR links, tab live-send, and Canvas image conversion work now. Cross-device WebRTC, server-side storage, Office/PDF/media/OCR processing, authentication, and security scanning need the backend milestones below.

## Next Backend Milestones

1. Replace IndexedDB storage with API-backed S3/local object storage and MongoDB metadata.
2. Replace `BroadcastChannel` demo live sharing with WebRTC data channels and Socket.IO signaling.
3. Add worker queues for LibreOffice, FFmpeg, Tesseract OCR, Poppler, Ghostscript, Pandoc, and pdfcpu.
4. Add authentication, file expiration, virus scanning, rate limiting, and private share permissions.
