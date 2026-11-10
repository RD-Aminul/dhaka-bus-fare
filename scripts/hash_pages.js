import fs from 'fs';
import crypto from 'crypto';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function hashPages() {
  const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log('Total doc pages:', doc.numPages);

  const hashes = {};
  for (let p = 1; p <= 116; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    const buf = canvas.toBuffer('image/png');
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    hashes[p] = hash;
  }

  // Check for duplicates
  const map = {};
  for (let p = 1; p <= 116; p++) {
    const h = hashes[p];
    if (!map[h]) map[h] = [];
    map[h].push(p);
  }
  console.log('Duplicates in entire PDF:');
  for (const [h, pages] of Object.entries(map)) {
    if (pages.length > 1) {
      console.log(`Hash ${h.slice(0, 8)} is shared by pages:`, pages);
    }
  }
}
hashPages().catch(console.error);
