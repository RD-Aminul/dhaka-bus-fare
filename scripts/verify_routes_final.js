import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';

console.log('Checking ALL_BRTA_ROUTES sequence and uniqueness:');
console.log('Total routes:', ALL_BRTA_ROUTES.length);

const ids = new Set();
let hasDupeId = false;
let isOrdered = true;

for (let i = 0; i < ALL_BRTA_ROUTES.length; i++) {
  const r = ALL_BRTA_ROUTES[i];
  if (ids.has(r.id)) {
    console.error(`DUPLICATE ID: ${r.id} at index ${i}`);
    hasDupeId = true;
  }
  ids.add(r.id);
  if (r.pageNo !== i + 1) {
    console.error(`OUT OF SEQUENCE: expected page ${i + 1}, got ${r.pageNo}`);
    isOrdered = false;
  }
}

console.log('Has duplicate IDs:', hasDupeId);
console.log('Is strictly ordered 1 to 116:', isOrdered);
console.log('Page 1:', ALL_BRTA_ROUTES[0].routeCode, 'Page', ALL_BRTA_ROUTES[0].pageNo);
console.log('Page 14:', ALL_BRTA_ROUTES[13].routeCode, 'Page', ALL_BRTA_ROUTES[13].pageNo);
console.log('Page 19:', ALL_BRTA_ROUTES[18].routeCode, 'Page', ALL_BRTA_ROUTES[18].pageNo);
console.log('Page 35:', ALL_BRTA_ROUTES[34].routeCode, 'Page', ALL_BRTA_ROUTES[34].pageNo);
console.log('Page 116:', ALL_BRTA_ROUTES[115].routeCode, 'Page', ALL_BRTA_ROUTES[115].pageNo);
