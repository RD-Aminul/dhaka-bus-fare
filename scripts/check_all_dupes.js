import fs from 'fs';
const content = fs.readFileSync('src/data/allRoutesData.js', 'utf8');
const regex = /"id":\s*"([^"]+)"/g;
let m;
const ids = [];
while ((m = regex.exec(content)) !== null) {
  ids.push(m[1]);
}
console.log('Total IDs found:', ids.length);
const counts = {};
ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
const dupes = Object.entries(counts).filter(([id, c]) => c > 1);
console.log('Duplicate IDs:', dupes);
