import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testWasmRender() {
  const wasmDir = path.resolve('node_modules/pdfjs-dist/wasm/');
  console.log('Wasm dir exists:', fs.existsSync(wasmDir));

  const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const doc = await pdfjsLib.getDocument({
    data,
    wasmUrl: 'file:///' + wasmDir.replace(/\\/g, '/') + '/'
  }).promise;

  for (let pageNum = 13; pageNum <= 19; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const outPath = `C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/scratch/pages/page_${pageNum}.png`;
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`Successfully rendered page ${pageNum} (${canvas.width}x${canvas.height})`);
  }
}

testWasmRender().catch(console.error);
