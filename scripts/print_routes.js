import fs from 'fs';
const content = fs.readFileSync('src/data/allRoutesData.js', 'utf8');

const regex = /"id":\s*"([^"]+)",\s*"pageNo":\s*(\d+),\s*"routeCode":\s*"([^"]+)",\s*"title":\s*"([^"]+)"/g;
let m;
const list = [];
while ((m = regex.exec(content)) !== null) {
  list.push({ id: m[1], pageNo: parseInt(m[2]), title: m[4] });
}
console.log('Total extracted:', list.length);
list.forEach((r, idx) => {
  console.log(`${idx + 1}. [Page ${r.pageNo}] ${r.id}: ${r.title}`);
});
