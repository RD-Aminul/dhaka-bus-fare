import { ALL_BRTA_ROUTES } from '../src/data/allRoutesData.js';
import { normalizeBangla, bnToEnNumber, enToBnNumber } from '../src/utils/fareEngine.js';

function filterChartRoutes(chartSearchQuery) {
  if (!chartSearchQuery || !chartSearchQuery.trim()) {
    return [...ALL_BRTA_ROUTES].sort((a, b) => a.pageNo - b.pageNo);
  }

  const raw = chartSearchQuery.trim();
  const q = raw.toLowerCase();
  const qNormBn = normalizeBangla(raw);
  const qDigitsEn = bnToEnNumber(raw).replace(/\D/g, '');
  const isPureDigits = /^[0-9০-৯\s]+$/.test(raw);

  // 1. Explicit Page Search: "page 19", "পেজ ৩৫", "p 14", "p-14"
  const isExplicitPageSearch = q.startsWith('page') || q.startsWith('পেজ') || q.startsWith('p ') || q.startsWith('p-');
  if (isExplicitPageSearch && qDigitsEn) {
    const pageTarget = parseInt(qDigitsEn, 10);
    return ALL_BRTA_ROUTES.filter(r => r.pageNo === pageTarget).sort((a, b) => a.pageNo - b.pageNo);
  }

  // 2. Pure Numeric Search (e.g. "35", "৩৫", "101")
  // If user typed only a number: match exact pageNo OR exact route numeric code (e.g. 101 matches A-101)
  if (isPureDigits && qDigitsEn) {
    const num = parseInt(qDigitsEn, 10);
    const matched = ALL_BRTA_ROUTES.filter(route => {
      // Exact page match (e.g. page 35)
      if (route.pageNo === num) return true;

      // Exact route number match (e.g. 'A-101' -> '101' === '101')
      const routeNum = route.id.replace(/\D/g, '');
      if (routeNum === qDigitsEn) return true;

      return false;
    });

    return matched.sort((a, b) => a.pageNo - b.pageNo);
  }

  // 3. General Text & Location Search (e.g. "মিরপুর", "Savar", "A-101", "বিকল্প")
  return ALL_BRTA_ROUTES.filter(route => {
    // Route Code / ID Match (e.g. "a-101", "এ-১০১", "a101")
    const routeIdLower = route.id.toLowerCase();
    const routeCodeNorm = normalizeBangla(route.routeCode);
    const qClean = q.replace(/[-\s]/g, '');
    const idClean = routeIdLower.replace(/[-\s]/g, '');
    if (
      routeIdLower.includes(q) ||
      idClean.includes(qClean) ||
      routeCodeNorm.includes(qNormBn)
    ) {
      return true;
    }

    // Direct Page Number Match if mentioned
    if (qDigitsEn && String(route.pageNo) === qDigitsEn) {
      return true;
    }

    // Title & Via Location Match
    const titleNorm = normalizeBangla(route.title);
    const viaNorm = normalizeBangla(route.via || '');
    if (
      titleNorm.includes(qNormBn) ||
      viaNorm.includes(qNormBn) ||
      route.title.toLowerCase().includes(q) ||
      (route.via && route.via.toLowerCase().includes(q))
    ) {
      return true;
    }

    // Stops Location Match
    const stopMatch = route.stops.some(st => {
      const stBn = normalizeBangla(st.name);
      return stBn.includes(qNormBn);
    });
    if (stopMatch) return true;

    // Operating Bus Match
    const busMatch = route.buses.some(b => 
      b.toLowerCase().includes(q) || normalizeBangla(b).includes(qNormBn)
    );
    if (busMatch) return true;

    return false;
  }).sort((a, b) => a.pageNo - b.pageNo);
}

// Tests:
console.log('--- Search: "35" ---');
console.log(filterChartRoutes('35').map(r => `Page ${r.pageNo}: ${r.id} (${r.title})`));

console.log('--- Search: "৩৫" ---');
console.log(filterChartRoutes('৩৫').map(r => `Page ${r.pageNo}: ${r.id} (${r.title})`));

console.log('--- Search: "101" ---');
console.log(filterChartRoutes('101').map(r => `Page ${r.pageNo}: ${r.id} (${r.title})`));

console.log('--- Search: "Mirpur" (first 3) ---');
console.log(filterChartRoutes('Mirpur').slice(0, 3).map(r => `Page ${r.pageNo}: ${r.id} (${r.title})`));

console.log('--- Search: "" (first 5 and last 2) ---');
const empty = filterChartRoutes('');
console.log('Total:', empty.length);
console.log(empty.slice(0, 5).map(r => `Page ${r.pageNo}: ${r.id}`));
console.log(empty.slice(-2).map(r => `Page ${r.pageNo}: ${r.id}`));
