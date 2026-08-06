const converterGroups = [
  {
    title: 'PDF Tools',
    tools: ['PDF to Word', 'Word to PDF', 'PDF to PPT', 'PPT to PDF', 'PDF to Excel', 'Excel to PDF', 'PDF to JPG', 'JPG to PDF', 'Merge PDF', 'Split PDF', 'Compress PDF', 'OCR PDF']
  },
  {
    title: 'Word & Excel',
    tools: ['Word to JPG', 'Word to HTML', 'Word to TXT', 'Word to ODT', 'Word to EPUB', 'Excel to CSV', 'CSV to Excel', 'Excel to HTML', 'Excel to JSON']
  },
  {
    title: 'PowerPoint',
    tools: ['PPT to JPG', 'PPT to PNG', 'PPT to Video', 'PPT to HTML']
  },
  {
    title: 'Images',
    tools: ['JPG to PNG', 'PNG to JPG', 'WebP to PNG', 'PNG to WebP', 'HEIC to JPG', 'SVG to PNG', 'GIF to MP4', 'BMP to JPG']
  },
  {
    title: 'Video & Audio',
    tools: ['MP4 to AVI', 'AVI to MP4', 'MKV to MP4', 'MOV to MP4', 'Compress Video', 'Extract Audio', 'MP3 to WAV', 'WAV to MP3', 'AAC to MP3', 'FLAC to MP3']
  },
  {
    title: 'E-books & Archives',
    tools: ['EPUB to PDF', 'PDF to EPUB', 'MOBI to PDF', 'ZIP', 'RAR', '7ZIP', 'TAR', 'GZIP']
  }
];

const toolGrid = document.querySelector('#toolGrid');

toolGrid.innerHTML = converterGroups.map(group => `
  <article class="tool-category">
    <h3>${group.title}</h3>
    <ul>
      ${group.tools.map(tool => `<li>${tool}</li>`).join('')}
    </ul>
  </article>
`).join('');
