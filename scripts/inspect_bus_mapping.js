import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';

ALL_BRTA_ROUTES.forEach(r => {
  console.log(`Page ${r.pageNo} [${r.id}] ${r.title}`);
  console.log(`  Buses: ${r.buses.join(', ')}`);
});
