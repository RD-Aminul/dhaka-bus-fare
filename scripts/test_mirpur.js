import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';
import { normalizeBangla } from '../src/utils/fareEngine.js';
import { getStopEnglishName } from '../src/data/englishNames.js';

const q = 'mirpur';
const qNormBn = normalizeBangla(q);

const matches = ALL_BRTA_ROUTES.filter(route => {
  const titleNorm = normalizeBangla(route.title);
  const viaNorm = normalizeBangla(route.via || '');
  if (titleNorm.includes(q) || viaNorm.includes(q)) return true;

  return route.stops.some(st => {
    const stBn = normalizeBangla(st.name);
    const stEn = getStopEnglishName(st.name).toLowerCase();
    return stBn.includes(qNormBn) || stEn.includes(q);
  });
});

console.log('Matches for "mirpur":', matches.length);
console.log('Sample:', matches.slice(0, 5).map(r => r.id + ': ' + r.title));

const savarMatches = ALL_BRTA_ROUTES.filter(route => {
  const titleNorm = normalizeBangla(route.title);
  const viaNorm = normalizeBangla(route.via || '');
  if (titleNorm.includes('savar') || viaNorm.includes('savar')) return true;

  return route.stops.some(st => {
    const stBn = normalizeBangla(st.name);
    const stEn = getStopEnglishName(st.name).toLowerCase();
    return stBn.includes('savar') || stEn.includes('savar');
  });
});
console.log('Matches for "savar":', savarMatches.length);
