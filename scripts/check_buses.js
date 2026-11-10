import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';

console.log('--- Checking buses on routes ---');
ALL_BRTA_ROUTES.forEach((r, idx) => {
  console.log(`${r.pageNo}. [${r.id}] ${r.title} => Buses: ${JSON.stringify(r.buses)}`);
});
