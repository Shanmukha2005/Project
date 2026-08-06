# ShareFlow

ShareFlow is a full-stack portfolio project concept that combines instant file sharing, live peer-to-peer transfer, and a complete PDF/file conversion suite in one web application.

## Prototype

This repository currently includes a responsive static homepage prototype:

- `index.html` defines the ShareFlow landing page, file sharing module, converter module, feature list, and architecture sections.
- `styles.css` provides the responsive visual design, cards, grids, hero section, and mobile layout.
- `app.js` renders the converter category lists from structured data.

Open `index.html` in a browser or serve the folder with any static file server.

## Core Modules

### File Sharing

- Upload images, videos, PDFs, Word, Excel, PowerPoint, ZIP, audio, and arbitrary files.
- Generate a six-character retrieval code and QR code after upload.
- Retrieve files by code with preview, download, share again, and delete actions.
- Support live sharing sessions with a session code and QR code.
- Use WebRTC for peer-to-peer transfer and Socket.IO for signaling.
- Support camera capture, camera video, audio, documents, and clipboard sharing.

### PDF & File Converter

ShareFlow is designed to include PDF, Office, image, video, audio, ebook, archive, and OCR tools, including:

- PDF to Word, Word to PDF, PDF to PPT, PPT to PDF, PDF to Excel, Excel to PDF.
- PDF merge, split, compress, rotate, unlock, protect, watermark, OCR, HTML conversion, and text extraction.
- Word, Excel, PowerPoint, image, video, audio, ebook, and archive conversions.
- Batch conversion, drag-and-drop uploads, conversion history, cloud storage integrations, dark mode, and multi-language support.

## Suggested Architecture

```text
ShareFlow
├── File Sharing Module
│   ├── Upload/Retrieve
│   ├── QR Share
│   └── Live Sharing
├── Document Converter Module
│   ├── PDF Tools
│   ├── Office Tools
│   └── Media Tools
└── Node.js + Express APIs
    ├── MongoDB
    ├── AWS S3 or local storage
    └── Socket.IO + WebRTC
```

## Suggested Tech Stack

- Frontend: React.js, TypeScript, Tailwind CSS, React Router, Socket.IO Client, QR code generator.
- Backend: Node.js, Express.js, Socket.IO, WebRTC signaling server, REST APIs.
- Database: MongoDB.
- Storage: AWS S3 or local storage during development.
- Conversion tools: LibreOffice, Poppler, Ghostscript, ImageMagick, FFmpeg, Tesseract OCR, Pandoc, PDF-lib, and pdfcpu.
- Deployment: AWS EC2, Nginx, Docker, and GitHub Actions.
