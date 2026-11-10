import { 
  ALL_BRTA_ROUTES, 
  calculatePdfFare, 
  BRTA_RATE_PER_KM, 
  BRTA_MIN_FARE 
} from '../data/allRoutesData.js';
import { DHAKA_LOCATIONS } from '../data/busRoutes.js';
import { getStopEnglishName, STOP_ENGLISH_MAP } from '../data/englishNames.js';

// Normalize Bangla text: remove nukta variations, hyphens, brackets, whitespace
export function normalizeBangla(text = '') {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\u09bc/g, '') // remove nukta
    .replace(/[()\-–—_.,\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Convert English numerals to Bengali numerals
export function enToBnNumber(num) {
  if (num === null || num === undefined) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, d => bn[Number(d)]);
}

// Convert Bengali numerals to English numerals
export function bnToEnNumber(str = '') {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.toString().replace(/[০-৯]/g, d => bn.indexOf(d));
}

// Common Stop Synonyms in Dhaka Metro
const STOP_SYNONYMS = {
  'সদরঘাট': ['ভিক্টোরিয়া পার্ক', 'ভিক্টোরিয়া পার্ক', 'ভিক্টোরিয়াপার্ক', 'সদরঘাট', 'sadarghat', 'victoria park'],
  'ভিক্টোরিয়া পার্ক': ['সদরঘাট', 'ভিক্টোরিয়াপার্ক', 'ভিক্টোরিয়া পার্ক', 'sadarghat', 'victoria park'],
  'ভিক্টোরিয়া পার্ক': ['সদরঘাট', 'ভিক্টোরিয়াপার্ক', 'ভিক্টোরিয়া পার্ক', 'sadarghat', 'victoria park'],
  'গুলিস্তান': ['গোলাপশাহ মাজার', 'ফুলবাড়িয়া', 'ফুলবাড়িয়া', 'গুলিস্তান মোড়', 'গুলিস্তান', 'gulistan', 'fulbaria'],
  'ফুলবাড়িয়া': ['গুলিস্তান', 'গোলাপশাহ মাজার', 'ফুলবাড়িয়া', 'fulbaria', 'gulistan'],
  'কমলাপুর': ['পীরজঙ্গী মাজার', 'কমলাপুর স্টেশন', 'কমলাপুর', 'kamalapur'],
  'উত্তরা': ['হাউজ বিল্ডিং', 'হাউজবিল্ডিং', 'আজমপুর', 'রাজলক্ষ্মী', 'উত্তরা', 'uttara', 'house building'],
  'হাউজ বিল্ডিং': ['উত্তরা', 'হাউজ বিল্ডিং', 'house building', 'uttara'],
  'ইসিবি চত্বর': ['মানিকদি', 'ইসিবি মোড়', 'ইসিবি চত্বর', 'ecb', 'manikdi'],
  'মানিকদি': ['ইসিবি চত্বর', 'ইসিবি মোড়', 'মানিকদি', 'ecb', 'manikdi'],
  'চিড়িয়াখানা': ['মিরপুর চিড়িয়াখানা', 'চিড়িয়াখানা', 'সনি সিনেমা হল', 'zoo', 'mirpur zoo'],
  'কাঁচপুর': ['কাঁচপুর ব্রিজ', 'কাচপুর ব্রিজ', 'কাঁচপুর ব্রীজ', 'kachpur', 'kachpur bridge'],
  'সাভার': ['সাভার বাসস্ট্যান্ড', 'সাভার বাজার', 'সাভার', 'savar'],
  'যাত্রাবাড়ী': ['যাত্রাবাড়ী', 'যাত্রাবাড়ী চৌরাস্তা', 'যাত্রাবাড়ী মোড়', 'jatrabari']
};

// Check if stop matches target query (Bilingual: English + Bangla)
export function stopMatches(stopName, query) {
  if (!stopName || !query) return false;

  const nStopBn = normalizeBangla(stopName);
  const nQueryBn = normalizeBangla(query);
  const qLower = query.toString().toLowerCase().trim();
  const stopEn = getStopEnglishName(stopName).toLowerCase();

  // 1. Direct Bengali match
  if (nStopBn === nQueryBn || nStopBn.includes(nQueryBn) || nQueryBn.includes(nStopBn)) {
    return true;
  }

  // 2. Direct English match
  if (stopEn === qLower || stopEn.includes(qLower) || qLower.includes(stopEn)) {
    return true;
  }

  // 3. Check Synonyms
  for (const [key, list] of Object.entries(STOP_SYNONYMS)) {
    const nKey = normalizeBangla(key);
    const keyEn = key.toLowerCase();
    
    if (nQueryBn.includes(nKey) || nKey.includes(nQueryBn) || qLower.includes(keyEn) || keyEn.includes(qLower)) {
      if (list.some(syn => {
        const nSyn = normalizeBangla(syn);
        const synLower = syn.toLowerCase();
        return nStopBn.includes(nSyn) || nSyn.includes(nStopBn) || stopEn.includes(synLower) || synLower.includes(stopEn);
      })) {
        return true;
      }
    }
  }

  return false;
}

// Haversine Distance (km)
export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calibrated Dhaka road distance
export function estimateDhakaRoadKm(lat1, lon1, lat2, lon2) {
  const straightKm = getHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return Number((straightKm * 1.32).toFixed(1));
}

// Standard BRTA Fare
export function calculateBrtaFareFromKm(km) {
  if (!km || km <= 0) return 0;
  return calculatePdfFare(0, km);
}

// Find location in master locations list (Supports Bangla and English)
export function findLocationInDhaka(query) {
  if (!query) return null;
  const normBn = normalizeBangla(query);
  const qLower = query.toString().toLowerCase().trim();

  return DHAKA_LOCATIONS.find(loc => {
    const nNameBn = normalizeBangla(loc.name);
    const nNameEn = (loc.nameEn || '').toLowerCase();
    return (
      nNameBn.includes(normBn) ||
      normBn.includes(nNameBn) ||
      nNameEn.includes(qLower) ||
      qLower.includes(nNameEn) ||
      stopMatches(loc.name, query)
    );
  }) || null;
}

// Get the actual pairwise PDF fare between two stops within a specific route
export function getRouteActualFare(route, fromStopName, toStopName) {
  const stopA = route.stops.find(s => stopMatches(s.name, fromStopName));
  const stopB = route.stops.find(s => stopMatches(s.name, toStopName));

  if (!stopA || !stopB) return null;

  const distance = Math.abs(Number((stopB.km - stopA.km).toFixed(1)));
  const fare = calculatePdfFare(stopA.km, stopB.km);

  return {
    routeId: route.id,
    routeCode: route.routeCode,
    routeTitle: route.title,
    pageNo: route.pageNo,
    via: route.via,
    buses: route.buses,
    fromStop: stopA.name,
    fromStopEn: getStopEnglishName(stopA.name),
    toStop: stopB.name,
    toStopEn: getStopEnglishName(stopB.name),
    distanceKm: distance,
    fare: fare
  };
}

// Generate the complete Triangular Fare Matrix for a Route (just like the PDF)
export function generateRouteMatrix(route) {
  const matrix = [];
  const stops = route.stops;

  for (let i = 0; i < stops.length; i++) {
    const row = {
      stop: stops[i],
      stopEn: getStopEnglishName(stops[i].name),
      fares: []
    };
    for (let j = 0; j <= i; j++) {
      if (i === j) {
        row.fares.push({
          from: stops[i].name,
          fromEn: getStopEnglishName(stops[i].name),
          to: stops[j].name,
          toEn: getStopEnglishName(stops[j].name),
          fare: 0,
          isDiagonal: true
        });
      } else {
        const fare = calculatePdfFare(stops[j].km, stops[i].km);
        row.fares.push({
          from: stops[j].name,
          fromEn: getStopEnglishName(stops[j].name),
          to: stops[i].name,
          toEn: getStopEnglishName(stops[i].name),
          fare: fare,
          distance: Math.abs(Number((stops[i].km - stops[j].km).toFixed(1)))
        });
      }
    }
    matrix.push(row);
  }
  return matrix;
}

// Major Transit Hubs in Dhaka for smart connection weighting
const MAJOR_HUBS = [
  'ফার্মগেট', 'মহাখালী', 'শাহবাগ', 'পল্টন', 'গুলিস্তান', 'মতিঝিল', 
  'মিরপুর-১০', 'গাবতলী', 'শ্যামলী', 'আসাদগেট', 'কাকলী', 'এয়ারপোর্ট',
  'রামপুরা', 'বাড্ডা', 'নতুন বাজার', 'সায়েন্সল্যাব', 'সায়েদাবাদ', 'যাত্রাবাড়ী'
];

// Find 1-Transfer Connecting Routes when no direct bus exists
export function findTransferRoutes(fromName, toName) {
  if (!fromName || !toName) return [];

  // Find all routes that contain fromName
  const routesFrom = ALL_BRTA_ROUTES.filter(r => 
    r.stops.some(s => stopMatches(s.name, fromName))
  );

  // Find all routes that contain toName
  const routesTo = ALL_BRTA_ROUTES.filter(r => 
    r.stops.some(s => stopMatches(s.name, toName))
  );

  if (routesFrom.length === 0 || routesTo.length === 0) return [];

  const candidates = [];
  const seenPairs = new Set();

  for (const rf of routesFrom) {
    for (const sf of rf.stops) {
      // Don't transfer at fromName itself
      if (stopMatches(sf.name, fromName)) continue;

      for (const rt of routesTo) {
        if (rf.id === rt.id) continue;

        // Check if destination route also has this transfer stop
        const hasHub = rt.stops.some(st => stopMatches(st.name, sf.name));
        if (hasHub) {
          const hubName = sf.name;
          const pairKey = `${rf.id}->${hubName}->${rt.id}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const leg1 = getRouteActualFare(rf, fromName, hubName);
          const leg2 = getRouteActualFare(rt, hubName, toName);

          if (leg1 && leg2 && leg1.distanceKm > 0 && leg2.distanceKm > 0) {
            const isMajorHub = MAJOR_HUBS.some(h => stopMatches(h, hubName));
            candidates.push({
              hub: hubName,
              hubEn: getStopEnglishName(hubName),
              isMajorHub,
              totalFare: leg1.fare + leg2.fare,
              totalDistance: Number((leg1.distanceKm + leg2.distanceKm).toFixed(1)),
              leg1,
              leg2
            });
          }
        }
      }
    }
  }

  // Sort candidates: Major hubs first, then shortest total distance
  candidates.sort((a, b) => {
    if (a.isMajorHub && !b.isMajorHub) return -1;
    if (!a.isMajorHub && b.isMajorHub) return 1;
    return a.totalDistance - b.totalDistance;
  });

  // Pick diverse distinct hubs (max 3)
  const uniqueHubTransfers = [];
  const usedHubs = new Set();

  for (const c of candidates) {
    if (!usedHubs.has(c.hub)) {
      usedHubs.add(c.hub);
      uniqueHubTransfers.push(c);
      if (uniqueHubTransfers.length >= 3) break;
    }
  }

  return uniqueHubTransfers;
}

// Main Search across all BRTA routes (Supports Bilingual search)
export function searchRouteAndFare(fromName, toName, targetRouteId = null) {
  if (!fromName || !toName) return null;

  if (stopMatches(fromName, toName)) {
    return {
      error: "শুরুর স্থান এবং গন্তব্য একই হতে পারে না। / Origin and Destination cannot be the same."
    };
  }

  // If searching within a specific selected route
  if (targetRouteId) {
    const route = ALL_BRTA_ROUTES.find(r => r.id === targetRouteId);
    if (route) {
      const match = getRouteActualFare(route, fromName, toName);
      if (match) {
        return {
          type: "OFFICIAL_PDF",
          from: match.fromStop,
          fromEn: match.fromStopEn,
          to: match.toStop,
          toEn: match.toStopEn,
          fare: match.fare,
          distanceKm: match.distanceKm,
          routes: [match],
          allBuses: route.buses,
          notes: `বিআরটিএ অফিসিয়াল চার্ট (পেজ নং ${enToBnNumber(route.pageNo)}) অনুযায়ী হুবহু আসল চার্ট ভাড়া।`
        };
      }
    }
  }

  // Search across ALL routes in catalog
  const matchingRoutes = [];

  for (const route of ALL_BRTA_ROUTES) {
    const match = getRouteActualFare(route, fromName, toName);
    if (match) {
      matchingRoutes.push(match);
    }
  }

  if (matchingRoutes.length > 0) {
    // Sort by shortest direct distance
    matchingRoutes.sort((a, b) => a.distanceKm - b.distanceKm);
    const bestMatch = matchingRoutes[0];
    const allBuses = [...new Set(matchingRoutes.flatMap(r => r.buses))];

    return {
      type: "OFFICIAL_PDF",
      from: bestMatch.fromStop,
      fromEn: bestMatch.fromStopEn,
      to: bestMatch.toStop,
      toEn: bestMatch.toStopEn,
      fare: bestMatch.fare,
      distanceKm: bestMatch.distanceKm,
      routes: matchingRoutes,
      allBuses: allBuses,
      notes: `বিআরটিএ প্রজ্ঞাপন চার্ট (পেজ নং ${enToBnNumber(bestMatch.pageNo)}) অনুযায়ী নির্ধারিত আসল ভাড়া।`
    };
  }

  // Check for 1-Transfer Multi-Hop Connecting Routes
  const transferOptions = findTransferRoutes(fromName, toName);
  if (transferOptions.length > 0) {
    const bestTransfer = transferOptions[0];
    const allBuses = [...new Set([...bestTransfer.leg1.buses, ...bestTransfer.leg2.buses])];

    return {
      type: "TRANSFER_ROUTE",
      from: bestTransfer.leg1.fromStop,
      fromEn: bestTransfer.leg1.fromStopEn,
      to: bestTransfer.leg2.toStop,
      toEn: bestTransfer.leg2.toStopEn,
      transferHub: bestTransfer.hub,
      transferHubEn: bestTransfer.hubEn,
      transfers: transferOptions,
      bestTransfer: bestTransfer,
      fare: bestTransfer.totalFare,
      distanceKm: bestTransfer.totalDistance,
      allBuses: allBuses,
      notes: `সরাসরি বাস পাওয়া যায়নি। ${bestTransfer.hub}-এ বাস পরিবর্তন করে সহজে যাওয়া যাবে।`
    };
  }

  // If not found in any official route, use Smart Dhaka Road Distance calculation
  const locFrom = findLocationInDhaka(fromName);
  const locTo = findLocationInDhaka(toName);

  if (locFrom && locTo) {
    const estimatedKm = estimateDhakaRoadKm(locFrom.lat, locFrom.lng, locTo.lat, locTo.lng);
    const calculatedFare = calculateBrtaFareFromKm(estimatedKm);

    // Identify nearby buses passing through adjacent corridors
    const nearbyBuses = [];
    ALL_BRTA_ROUTES.forEach(route => {
      let match = false;
      route.stops.forEach(st => {
        if (stopMatches(st.name, locFrom.name) || stopMatches(st.name, locTo.name)) {
          match = true;
        }
      });
      if (match) {
        route.buses.forEach(b => {
          if (!nearbyBuses.includes(b)) nearbyBuses.push(b);
        });
      }
    });

    return {
      type: "ESTIMATED_CALCULATION",
      from: locFrom.name,
      fromEn: locFrom.nameEn || getStopEnglishName(locFrom.name),
      to: locTo.name,
      toEn: locTo.nameEn || getStopEnglishName(locTo.name),
      isUnlistedInPdf: true,
      fare: calculatedFare,
      distanceKm: estimatedKm,
      allBuses: nearbyBuses.length > 0 ? nearbyBuses : ["আশেপাশের নিয়মিত লোকাল ও সিটিং বাস"],
      notes: `উক্ত স্টপটি নির্দিষ্ট কোনো একক অফিসিয়াল রুটে না থাকায় ঢাকা রোড দূরত্ব (${enToBnNumber(estimatedKm)} কিমি) অনুযায়ী সরকারি নীতিমালায় হিসাব করা হয়েছে।`
    };
  }

  // Custom manual fallback
  return {
    type: "CUSTOM_MANUAL",
    from: fromName,
    fromEn: getStopEnglishName(fromName),
    to: toName,
    toEn: getStopEnglishName(toName),
    isUnlistedInPdf: true,
    distanceKm: 5.0,
    fare: calculateBrtaFareFromKm(5.0),
    allBuses: ["যাত্রাপথের নিয়মিত বাসসমূহ"],
    notes: "স্টপের সঠিক লোকেশন পাওয়া যায়নি। আপনি নিচে কিলোমিটার পরিবর্তন করে সরকারি ভাড়া দেখে নিতে পারেন।"
  };
}
