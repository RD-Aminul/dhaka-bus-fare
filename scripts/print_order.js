import fs from 'fs';
const content = fs.readFileSync('src/data/allRoutesData.js', 'utf8');
const regex = /"pageNo":\s*(\d+)/g;
let match;
const pages = [];
while ((match = regex.exec(content)) !== null) {
  pages.push(parseInt(match[1]));
}
console.log('Pages count:', pages.length);
console.log('Pages sequence:', pages.join(', '));
