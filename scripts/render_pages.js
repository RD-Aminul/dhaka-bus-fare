import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function render() {
  const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const doc = await pdfjsLib.getDocument({
    data,
    wasmUrl: 'wasm/'
  }).promise;

  const outDir = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/scratch/pages';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p of [18, 19, 20, 21, 22, 23, 24]) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport
    }).promise;

    const outPath = path.join(outDir, `page_${p}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`Rendered page ${p} (${canvas.width}x${canvas.height})`);
  }
}

render().catch(console.error);
