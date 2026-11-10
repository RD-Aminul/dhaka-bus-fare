import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function inspectXObjects() {
  const pdfPath = 'C:/Users/User/.gemini/antigravity/brain/58fa70bf-c85a-4639-8f2d-ad41730ef1d8/.user_uploaded/media_1794139452637_1d9b7380.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  for (let p = 13; p <= 19; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    console.log(`Page ${p} operator count:`, ops.fnArray.length);
    const imgOps = ops.fnArray.filter(fn => fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject);
    console.log(`Page ${p} paintImage ops:`, imgOps.length);
    // Find image name in args
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        console.log(`Page ${p} image objId:`, ops.argsArray[i][0]);
      }
    }
  }
}

inspectXObjects().catch(console.error);
