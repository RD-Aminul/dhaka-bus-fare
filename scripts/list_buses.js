import fs from 'fs';
import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';

const allBuses = new Map();

ALL_BRTA_ROUTES.forEach(route => {
  route.buses.forEach(b => {
    if (!allBuses.has(b)) allBuses.set(b, []);
    allBuses.get(b).push({
      routeCode: route.routeCode,
      title: route.title,
      pageNo: route.pageNo
    });
  });
});

console.log('Total unique buses:', allBuses.size);
for (const [bus, routes] of allBuses.entries()) {
  console.log(`\n=== [${bus}] (${routes.length} routes) ===`);
  routes.forEach(r => console.log(`  - Page ${r.pageNo} (${r.routeCode}): ${r.title}`));
}
