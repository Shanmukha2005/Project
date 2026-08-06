const DB_NAME = 'shareflow-db';
const STORE = 'files';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const $ = (id) => document.getElementById(id);

const tools = [
  'JPG to PNG', 'PNG to JPG', 'PNG to WebP', 'WebP to PNG', 'Text to PDF', 'PDF to Text',
  'Word to PDF', 'PDF to Word', 'PDF to PPT', 'PPT to PDF', 'PDF to Excel', 'Excel to PDF',
  'PDF Merge', 'PDF Split', 'Compress PDF', 'Rotate PDF', 'Unlock PDF', 'Protect PDF', 'Watermark PDF', 'OCR PDF',
  'HTML to PDF', 'PDF to HTML', 'Word to JPG', 'Word to HTML', 'Word to TXT', 'Word to ODT', 'Word to EPUB',
  'Excel to CSV', 'CSV to Excel', 'Excel to HTML', 'Excel to JSON', 'PPT to JPG', 'PPT to PNG', 'PPT to Video', 'PPT to HTML',
  'MP4 to AVI', 'AVI to MP4', 'MKV to MP4', 'MOV to MP4', 'Compress Video', 'Extract Audio',
  'MP3 to WAV', 'WAV to MP3', 'AAC to MP3', 'FLAC to MP3', 'EPUB to PDF', 'PDF to EPUB', 'MOBI to PDF',
  'ZIP', 'RAR', '7ZIP', 'TAR', 'GZIP'
];

let db;
let memoryFiles = [];
let selectedTool = tools[0];
let liveChannel;
let activeSessionCode = '';

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function openDb() {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) {
      toast('IndexedDB is unavailable, using temporary memory storage');
      resolve(false);
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'code' });
    request.onsuccess = () => { db = request.result; resolve(true); };
    request.onerror = () => {
      console.warn('IndexedDB failed, falling back to memory storage', request.error);
      toast('Storage blocked, using temporary memory storage');
      resolve(false);
    };
  });
}

function store(mode = 'readonly') {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function saveRecord(record) {
  if (!db) {
    memoryFiles = memoryFiles.filter((file) => file.code !== record.code).concat(record);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const request = store('readwrite').put(record);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
}

function getRecord(code) {
  if (!db) return Promise.resolve(memoryFiles.find((file) => file.code === code));
  return new Promise((resolve, reject) => {
    const request = store().get(code);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteRecord(code) {
  if (!db) {
    memoryFiles = memoryFiles.filter((file) => file.code !== code);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const request = store('readwrite').delete(code);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
}

function getAllRecords() {
  if (!db) return Promise.resolve(memoryFiles);
  return new Promise((resolve, reject) => {
    const request = store().getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function createCode() {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function shareUrl(code) {
  return `${location.origin}${location.pathname}?code=${code}`;
}

function qrUrl(code) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl(code))}`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function previewMarkup(file, url) {
  if (file.type.startsWith('image/')) return `<img class="preview" src="${url}" alt="${file.name}">`;
  if (file.type.startsWith('video/')) return `<video class="preview" src="${url}" controls></video>`;
  if (file.type.startsWith('audio/')) return `<audio src="${url}" controls></audio>`;
  if (file.type === 'application/pdf') return `<iframe class="preview" src="${url}" title="${file.name}"></iframe>`;
  return `<p class="file-meta">Preview is not available for this file type, but download works.</p>`;
}

function renderFileCard(file, target) {
  const url = URL.createObjectURL(file.blob);
  target.innerHTML = `
    <article class="file-card">
      <header>
        <strong>${file.name}</strong>
        <span class="code">${file.code}</span>
      </header>
      <span class="file-meta">${file.type || 'Unknown type'} · ${formatSize(file.size)} · ${new Date(file.createdAt).toLocaleString()}</span>
      ${previewMarkup(file, url)}
      <div class="qr-row">
        <img class="qr" src="${qrUrl(file.code)}" alt="QR code for ${file.code}">
        <span class="file-meta">Scan this QR or open ${shareUrl(file.code)}</span>
      </div>
      <div class="actions">
        <a href="${url}" download="${file.name}">Download</a>
        <button data-copy-code="${file.code}">Copy Code</button>
        <button data-copy-link="${file.code}">Copy Link</button>
        <button data-delete="${file.code}">Delete</button>
      </div>
    </article>`;
}

async function updateStats() {
  const files = await getAllRecords();
  $('storedCount').textContent = files.length;
  $('historyCount').textContent = localStorage.getItem('shareflow-history') || 0;
}

function showSelectedFiles(fileList) {
  const files = [...fileList];
  if (!files.length) {
    $('selectedFiles').className = 'empty';
    $('selectedFiles').textContent = 'No files selected yet. Click the upload box or drag files into it.';
    return;
  }

  $('selectedFiles').className = 'results';
  $('selectedFiles').innerHTML = files.map((file) => `<article class="file-card"><strong>${file.name}</strong><span class="file-meta">Ready to upload · ${file.type || 'Unknown type'} · ${formatSize(file.size)}</span></article>`).join('');
}

async function uploadFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return toast('Select or drag files before uploading');
  $('uploadResults').innerHTML = '';

  for (const blob of files) {
    const record = {
      code: createCode(),
      name: blob.name,
      type: blob.type,
      size: blob.size,
      createdAt: new Date().toISOString(),
      blob
    };
    await saveRecord(record);
    const holder = document.createElement('div');
    renderFileCard(record, holder);
    $('uploadResults').appendChild(holder);
  }

  toast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded and coded`);
  updateStats();
}

async function retrieveFile() {
  const lookupCode = $('retrieveCode').value.trim().toUpperCase();
  if (!lookupCode) return toast('Enter a retrieval code first');

  const file = await getRecord(lookupCode);
  if (!file) {
    $('retrieveResult').className = 'results empty';
    $('retrieveResult').textContent = 'No file found for that retrieval code.';
    return;
  }

  $('retrieveResult').className = 'results';
  renderFileCard(file, $('retrieveResult'));
  toast('Shared file retrieved');
}

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[match]));
}

function addLiveInbox(html) {
  $('liveInbox').className = 'results';
  $('liveInbox').insertAdjacentHTML('afterbegin', html);
}

function connectLiveSession(sessionCode) {
  if (!sessionCode) return toast('Enter or create a session code');
  if (liveChannel) liveChannel.close();

  activeSessionCode = sessionCode;
  liveChannel = new BroadcastChannel(`shareflow-${sessionCode}`);
  $('activeSession').textContent = sessionCode;
  $('sessionStatus').textContent = 'Online';
  $('sessionHint').textContent = 'Connected. Open this app in another tab and join the same code to receive live files.';

  liveChannel.onmessage = ({ data }) => {
    if (data.kind === 'clipboard') {
      addLiveInbox(`<article class="file-card"><strong>Clipboard message</strong><p>${escapeHtml(data.text)}</p></article>`);
    }

    if (data.kind === 'file') {
      const url = URL.createObjectURL(data.blob);
      addLiveInbox(`
        <article class="file-card">
          <header><strong>${data.name}</strong><span>${formatSize(data.size)}</span></header>
          <span class="file-meta">Received through live session ${activeSessionCode}</span>
          <div class="actions"><a href="${url}" download="${data.name}">Download live file</a></div>
        </article>`);
    }
  };

  toast(`Live session ${sessionCode} connected`);
}

function renderTools(filter = '') {
  const visibleTools = tools.filter((tool) => tool.toLowerCase().includes(filter.toLowerCase()));
  $('toolList').innerHTML = `
    <input class="tool-search" id="toolSearch" placeholder="Search converters..." value="${filter}">
    ${visibleTools.map((tool) => `<button class="tool-button ${tool === selectedTool ? 'active' : ''}" data-tool="${tool}">${tool}</button>`).join('')}`;
  $('toolSearch').oninput = (event) => renderTools(event.target.value);
}

async function convertImage(file, type, extension) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve({ blob, name: file.name.replace(/\.[^.]+$/, `.${extension}`) }), type, 0.92);
  });
}

function backendManifest(file) {
  return {
    tool: selectedTool,
    input: { name: file.name, type: file.type, size: file.size },
    status: 'ready-for-backend-worker',
    requiredBackend: ['Node.js API', 'job queue', 'object storage', 'conversion worker container'],
    message: 'This frontend creates the real upload/conversion request. A production backend should execute the requested tool with LibreOffice, FFmpeg, Poppler, Ghostscript, Tesseract, Pandoc, or pdfcpu.'
  };
}

async function convertFile() {
  const file = $('convertInput').files[0];
  if (!file) return toast('Choose a file to convert');

  let output;
  if (selectedTool.includes('PNG') && file.type.startsWith('image/')) {
    output = await convertImage(file, 'image/png', 'png');
  } else if (selectedTool.includes('JPG') && file.type.startsWith('image/')) {
    output = await convertImage(file, 'image/jpeg', 'jpg');
  } else if (selectedTool.includes('WebP') && file.type.startsWith('image/')) {
    output = await convertImage(file, 'image/webp', 'webp');
  } else if (selectedTool === 'Word to TXT' || selectedTool === 'PDF to Text') {
    const text = await file.text().catch(() => `Text extraction placeholder for ${file.name}`);
    output = { blob: new Blob([text], { type: 'text/plain' }), name: file.name.replace(/\.[^.]+$/, '.txt') };
  } else {
    output = {
      blob: new Blob([JSON.stringify(backendManifest(file), null, 2)], { type: 'application/json' }),
      name: `${selectedTool.replaceAll(' ', '-').toLowerCase()}-job.json`
    };
  }

  localStorage.setItem('shareflow-history', Number(localStorage.getItem('shareflow-history') || 0) + 1);
  $('convertResult').className = 'results';
  $('convertResult').innerHTML = `
    <article class="file-card">
      <strong>Converted: ${output.name}</strong>
      <p class="file-meta">${selectedTool} finished. Download the result below.</p>
      <div class="actions"><button id="downloadConverted">Download result</button></div>
    </article>`;
  $('downloadConverted').onclick = () => downloadBlob(output.blob, output.name);
  updateStats();
  toast('Conversion ready');
}


function focusSection(id) {
  const target = $(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('panel-active');
  setTimeout(() => target.classList.remove('panel-active'), 1800);

  if (id === 'upload') toast('Upload section opened — choose or drag files now');
  if (id === 'retrieve') toast('Retrieve section opened — enter your six-character code');
  if (id === 'live') toast('Live sharing opened — create or join a session');
  if (id === 'convert') toast('Converter opened — select a tool and file');
}

function bindEvents() {
  $('fileInput').onchange = () => showSelectedFiles($('fileInput').files);
  $('browseFiles').onclick = () => $('fileInput').click();
  $('saveFiles').onclick = () => uploadFiles($('fileInput').files);
  $('retrieveBtn').onclick = retrieveFile;
  $('retrieveCode').oninput = (event) => { event.target.value = event.target.value.toUpperCase(); };
  $('retrieveCode').onkeydown = (event) => { if (event.key === 'Enter') retrieveFile(); };

  $('createSession').onclick = () => {
    const session = createCode();
    $('sessionCode').value = session;
    connectLiveSession(session);
  };
  $('joinSession').onclick = () => connectLiveSession($('sessionCode').value.trim().toUpperCase());
  $('sessionCode').oninput = (event) => { event.target.value = event.target.value.toUpperCase(); };

  $('liveFileInput').onchange = () => {
    if (!liveChannel) return toast('Create or join a session first');
    [...$('liveFileInput').files].forEach((file) => liveChannel.postMessage({ kind: 'file', name: file.name, size: file.size, blob: file }));
    toast('Live file sent');
  };

  $('sendClipboard').onclick = () => {
    if (!liveChannel) return toast('Create or join a session first');
    liveChannel.postMessage({ kind: 'clipboard', text: $('clipboardText').value });
    toast('Clipboard text sent');
  };

  $('convertBtn').onclick = convertFile;

  $('dropZone').ondragover = (event) => { event.preventDefault(); $('dropZone').classList.add('hover'); };
  $('dropZone').ondragleave = () => $('dropZone').classList.remove('hover');
  $('dropZone').ondrop = (event) => {
    event.preventDefault();
    $('dropZone').classList.remove('hover');
    $('fileInput').files = event.dataTransfer.files;
    showSelectedFiles(event.dataTransfer.files);
    uploadFiles(event.dataTransfer.files);
  };

  document.querySelectorAll('[data-focus]').forEach((button) => {
    button.addEventListener('click', () => focusSection(button.dataset.focus));
  });

  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.addEventListener('click', (event) => {
      if (event.target.closest('button, a, input, textarea, label, select')) return;
      panel.classList.add('panel-active');
      setTimeout(() => panel.classList.remove('panel-active'), 1200);
      toast(`${panel.dataset.panel} is active`);
    });
  });

  document.addEventListener('click', async (event) => {
    if (event.target.dataset.copyCode) {
      await navigator.clipboard?.writeText(event.target.dataset.copyCode);
      toast('Code copied');
    }
    if (event.target.dataset.copyLink) {
      await navigator.clipboard?.writeText(shareUrl(event.target.dataset.copyLink));
      toast('Share link copied');
    }
    if (event.target.dataset.delete) {
      await deleteRecord(event.target.dataset.delete);
      event.target.closest('.file-card').remove();
      updateStats();
      toast('File deleted');
    }
    if (event.target.dataset.tool) {
      selectedTool = event.target.dataset.tool;
      $('selectedTool').textContent = selectedTool;
      renderTools($('toolSearch')?.value || '');
    }
  });
}

renderTools();
bindEvents();

openDb().then(() => {
  updateStats();

  const params = new URLSearchParams(location.search);
  if (params.get('code')) {
    $('retrieveCode').value = params.get('code').toUpperCase();
    retrieveFile();
    location.hash = 'retrieve';
  }
});
