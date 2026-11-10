import fs from 'fs';
const content = fs.readFileSync('D:/My PP/dhaka-bus-fare/src/data/allRoutesData.js', 'utf8');

// Match id and pageNo
const regex = /"id":\s*"([^"]+)",\s*"pageNo":\s*(\d+)/g;
let match;
const routes = [];
while ((match = regex.exec(content)) !== null) {
  routes.push({ id: match[1], pageNo: parseInt(match[2]) });
}

console.log('Total routes found:', routes.length);
console.log('First 25 routes:', routes.slice(0, 25));

const counts = {};
routes.forEach(r => {
  counts[r.pageNo] = (counts[r.pageNo] || 0) + 1;
});
const dupes = Object.entries(counts).filter(([k, v]) => v > 1);
console.log('Duplicate page numbers:', dupes);

// Check if any id is duplicated
const idCounts = {};
routes.forEach(r => {
  idCounts[r.id] = (idCounts[r.id] || 0) + 1;
});
const idDupes = Object.entries(idCounts).filter(([k, v]) => v > 1);
console.log('Duplicate route IDs:', idDupes);
