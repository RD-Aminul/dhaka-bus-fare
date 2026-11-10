import fs from 'fs';
import http from 'http';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Polyfill Response.prototype.bytes if not present
if (!Response.prototype.bytes) {
  Response.prototype.bytes = async function () {
    return new Uint8Array(await this.arrayBuffer());
  };
}

// Start tiny HTTP server to serve wasm
const wasmDir = path.resolve('node_modules/pdfjs-dist/wasm');
const server = http.createServer((req, res) => {
  const filePath = path.join(wasmDir, req.url);
  if (fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'application/wasm' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(9876, async () => {
  try {
    const wasmUrl = 'http://127.0.0.1:9876/';
    console.log('Serving wasm from:', wasmUrl);

    const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
    const data = new Uint8Array(fs.readFileSync(pdfPath));

    const doc = await pdfjsLib.getDocument({
      data,
      wasmUrl,
      standardFontDataUrl: wasmUrl
    }).promise;

    console.log('Document loaded, rendering page 19 & 20...');
    const outDir = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/scratch/pages';

    for (let p of [19, 20, 21, 22, 23, 24]) {
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
  } catch (err) {
    console.error('Render error:', err);
  } finally {
    server.close();
  }
});
