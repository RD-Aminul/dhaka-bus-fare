import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Polyfill fetch for file:// URLs
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  const urlStr = url instanceof URL ? url.href : String(url);
  if (urlStr.startsWith('file:')) {
    const filePath = fileURLToPath(urlStr);
    const buffer = fs.readFileSync(filePath);
    return new Response(buffer);
  }
  return originalFetch(url, options);
};

async function renderPages() {
  const wasmDir = path.resolve('node_modules/pdfjs-dist/wasm/');
  const wasmUrl = pathToFileURL(wasmDir).href + '/';

  const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const doc = await pdfjsLib.getDocument({
    data,
    wasmUrl
  }).promise;

  const outDir = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/scratch/pages';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let pageNum = 18; pageNum <= 25; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const outPath = path.join(outDir, `page_${pageNum}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`Rendered page ${pageNum} to ${outPath} (${canvas.width}x${canvas.height})`);
  }
}

renderPages().catch(console.error);
