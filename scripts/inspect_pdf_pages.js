import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';

const data = new Uint8Array(fs.readFileSync(pdfPath));

const loadingTask = pdfjsLib.getDocument({
  data,
  useSystemFonts: true,
  disableFontFace: true,
});

const doc = await loadingTask.promise;
console.log('Total PDF pages:', doc.numPages);

for (let p = 12; p <= 25; p++) {
  const page = await doc.getPage(p);
  const textContent = await page.getTextContent();
  const strings = textContent.items.map(i => i.str).filter(s => s.trim().length > 0);
  console.log(`\n=== PDF Page ${p} ===`);
  console.log(strings.slice(0, 15).join(' | '));
}
