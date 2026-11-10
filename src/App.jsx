import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  ArrowRightLeft, 
  Calculator, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  FileText,
  Sliders,
  ChevronRight,
  Table,
  Globe,
  Route as RouteIcon,
  History,
  Copy,
  Share2,
  PhoneCall,
  GitFork,
  Check
} from 'lucide-react';
import { ALL_BRTA_ROUTES } from './data/allRoutesData';
import { DHAKA_LOCATIONS } from './data/busRoutes';
import { getStopEnglishName } from './data/englishNames';
import { TRANSLATIONS } from './data/translations';
import SearchableSelect from './components/SearchableSelect';
import { 
  searchRouteAndFare, 
  generateRouteMatrix,
  calculateBrtaFareFromKm, 
  enToBnNumber 
} from './utils/fareEngine';

export default function App() {
  // Language State: 'bn' | 'en'
  const [lang, setLang] = useState('bn');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'buses' | 'calculator' | 'charts'
  
  // Search Mode: 'by_route' | 'all_stops'
  const [searchMode, setSearchMode] = useState('by_route');
  
  // Selected Route ID (defaults to A-101)
  const [selectedRouteId, setSelectedRouteId] = useState('A-101');
  
  // Current active route object
  const currentRoute = useMemo(() => {
    return ALL_BRTA_ROUTES.find(r => r.id === selectedRouteId) || ALL_BRTA_ROUTES[0];
  }, [selectedRouteId]);

  // Stops state
  const [fromStop, setFromStop] = useState(() => currentRoute.stops[0].name);
  const [toStop, setToStop] = useState(() => currentRoute.stops[5]?.name || currentRoute.stops[currentRoute.stops.length - 1].name);

  // Search result
  const [searchResult, setSearchResult] = useState(() => 
    searchRouteAndFare(currentRoute.stops[0].name, currentRoute.stops[5]?.name, 'A-101')
  );
  
  // Custom adjusted KM in search result
  const [customAdjustedKm, setCustomAdjustedKm] = useState(null);

  // Show full triangular matrix table modal
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Direct KM Calculator tab state
  const [calcKm, setCalcKm] = useState(7.5);

  // Bus directory search
  const [busSearchQuery, setBusSearchQuery] = useState('');

  // Selected route for chart details in charts tab
  const [selectedRouteDetail, setSelectedRouteDetail] = useState(null);

  // Recent Searches in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('dhaka_bus_recent');
      return saved ? JSON.parse(saved) : [
        { from: 'মিরপুর-১০', to: 'ফার্মগেট' },
        { from: 'উত্তরা হাউজ বিল্ডিং', to: 'মতিঝিল' },
        { from: 'গাবতলী', to: 'সায়েদাবাদ' }
      ];
    } catch (e) {
      return [];
    }
  });

  // Toast notification message
  const [toastMessage, setToastMessage] = useState('');
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Number formatter helper
  const fmtNum = (n) => {
    if (n === null || n === undefined) return '';
    return lang === 'bn' ? enToBnNumber(n) : String(n);
  };

  // Formatted Route Options for Searchable Dropdown
  const routeOptions = useMemo(() => {
    return ALL_BRTA_ROUTES.map(rt => {
      const startEn = getStopEnglishName(rt.stops[0]?.name || '');
      const endEn = getStopEnglishName(rt.stops[rt.stops.length - 1]?.name || '');
      const pageText = `${t.pagePrefix} ${fmtNum(rt.pageNo)}`;
      const subInfo = `${t.viaPrefix} ${rt.via || ''} (${fmtNum(rt.totalKm)} ${t.kmUnit} • ${rt.buses.join(', ')})`;
      
      return {
        value: rt.id,
        label: `${rt.routeCode}: ${rt.title}`,
        labelEn: `${rt.id}: ${startEn} to ${endEn}`,
        badge: pageText,
        subText: subInfo,
        route: rt
      };
    });
  }, [lang, t]);

  // Formatted Stops for the currently selected Route
  const routeStopOptions = useMemo(() => {
    return currentRoute.stops.map(st => ({
      value: st.name,
      label: st.name,
      labelEn: getStopEnglishName(st.name),
      km: st.km,
      badge: `${fmtNum(st.km)} ${t.kmUnit}`
    }));
  }, [currentRoute, lang, t]);

  // Formatted All Dhaka Stops (for unrestricted search)
  const allDhakaStopOptions = useMemo(() => {
    return DHAKA_LOCATIONS.map(loc => ({
      value: loc.name,
      label: loc.name,
      labelEn: loc.nameEn || getStopEnglishName(loc.name),
      subText: loc.corridor ? (lang === 'bn' ? `কোরিডোর: ${loc.corridor}` : `Corridor: ${loc.corridor}`) : ''
    }));
  }, [lang]);

  // Handle Route change from searchable DDL
  const handleRouteChange = (newRouteId) => {
    setSelectedRouteId(newRouteId);
    const target = ALL_BRTA_ROUTES.find(r => r.id === newRouteId);
    if (target && target.stops.length > 1) {
      const newFrom = target.stops[0].name;
      const newTo = target.stops[Math.min(5, target.stops.length - 1)].name;
      setFromStop(newFrom);
      setToStop(newTo);
      const res = searchRouteAndFare(newFrom, newTo, newRouteId);
      setSearchResult(res);
      setCustomAdjustedKm(null);
    }
  };

  // Perform Search
  const handleSearch = (from = fromStop, to = toStop, routeId = (searchMode === 'by_route' ? selectedRouteId : null)) => {
    if (!from || !to) return;
    const res = searchRouteAndFare(from, to, routeId);
    setSearchResult(res);
    setCustomAdjustedKm(null);

    // Save to recent searches (deduplicated, max 5)
    if (from !== to) {
      setRecentSearches(prev => {
        const filtered = prev.filter(item => !(item.from === from && item.to === to));
        const updated = [{ from, to }, ...filtered].slice(0, 5);
        try {
          localStorage.setItem('dhaka_bus_recent', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  // Clear recent searches
  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('dhaka_bus_recent');
    } catch (e) {}
  };

  // Swap From & To
  const handleSwapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
    handleSearch(toStop, temp);
  };

  // Copy Fare Details to Clipboard
  const handleCopyFare = () => {
    if (!searchResult) return;
    const fromStr = lang === 'en' ? (searchResult.fromEn || searchResult.from) : searchResult.from;
    const toStr = lang === 'en' ? (searchResult.toEn || searchResult.to) : searchResult.to;
    const buses = (searchResult.allBuses || []).slice(0, 4).join(', ');
    
    let text = `🚌 ঢাকা বাস সরকারি ভাড়া (BRTA):\n📍 ${fromStr} ➔ ${toStr}\n💰 সরকারি আসল ভাড়া: ৳ ${displayFare} (দূরত্ব: ${displayDistance} কিমি)`;
    if (searchResult.type === 'TRANSFER_ROUTE' && searchResult.transferHub) {
      text += `\n🔄 বাস পরিবর্তনের স্থান: ${searchResult.transferHub}`;
    }
    if (buses) {
      text += `\n🚍 চলাচলকারী বাস: ${buses}`;
    }
    text += `\n⚖️ বিআরটিএ প্রজ্ঞাপন হার: ২.৭০ ৳/কিমি (সর্বনিম্ন ১০ ৳)`;

    navigator.clipboard.writeText(text).then(() => {
      showToast(t.fareCopiedToast);
    }).catch(() => {
      showToast(t.fareCopiedToast);
    });
  };

  // Share Fare Details via Web Share API
  const handleShareFare = async () => {
    if (!searchResult) return;
    const fromStr = lang === 'en' ? (searchResult.fromEn || searchResult.from) : searchResult.from;
    const toStr = lang === 'en' ? (searchResult.toEn || searchResult.to) : searchResult.to;
    const shareText = `🚌 ${fromStr} ➔ ${toStr} | সরকারি বাস ভাড়া: ৳ ${displayFare} (${displayDistance} কিমি) • বিআরটিএ অনুমোদিত রেট ২.৭০ ৳/কিমি`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dhaka Bus Actual Fare',
          text: shareText,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      handleCopyFare();
    }
  };

  // Full triangular matrix for current route
  const currentRouteMatrix = useMemo(() => {
    if (!currentRoute) return [];
    return generateRouteMatrix(currentRoute);
  }, [currentRoute]);

  // Bus list extraction with routes
  const busesWithRoutes = useMemo(() => {
    const map = new Map();
    ALL_BRTA_ROUTES.forEach(route => {
      route.buses.forEach(busName => {
        if (!map.has(busName)) {
          map.set(busName, []);
        }
        map.get(busName).push(route);
      });
    });
    return Array.from(map.entries()).map(([busName, routes]) => ({
      busName,
      routes
    }));
  }, []);

  const filteredBuses = useMemo(() => {
    if (!busSearchQuery.trim()) return busesWithRoutes;
    const q = busSearchQuery.toLowerCase();
    return busesWithRoutes.filter(item => 
      item.busName.toLowerCase().includes(q) ||
      item.routes.some(r => r.title.toLowerCase().includes(q) || r.routeCode.includes(q))
    );
  }, [busesWithRoutes, busSearchQuery]);

  // Current active display distance and fare in search result
  const displayDistance = customAdjustedKm !== null 
    ? customAdjustedKm 
    : (searchResult?.distanceKm || 0);

  const displayFare = customAdjustedKm !== null 
    ? calculateBrtaFareFromKm(customAdjustedKm) 
    : (searchResult?.fare || 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="bg-white/15 p-2 rounded-xl backdrop-blur-md shrink-0">
                <Bus className="w-6 h-6 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {t.appTitle}
                </h1>
                <p className="text-xs text-emerald-100/90 hidden sm:block truncate">
                  {t.appSubtitle}
                </p>
              </div>
            </div>
            
            {/* Language Switcher & Rate Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher Pill */}
              <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/20 backdrop-blur-sm shadow-inner">
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    lang === 'bn' 
                      ? 'bg-white text-emerald-950 shadow-sm' 
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    lang === 'en' 
                      ? 'bg-white text-emerald-950 shadow-sm' 
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  EN
                </button>
              </div>

              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 shrink-0">
                {t.rateBadge}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 sm:space-x-2 mt-4 border-t border-white/10 pt-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              {t.tabSearch}
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'calculator'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              {t.tabCalculator}
            </button>
            <button
              onClick={() => setActiveTab('buses')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'buses'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              {t.tabBuses} ({fmtNum(busesWithRoutes.length)})
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'charts'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {t.tabCharts} ({fmtNum(ALL_BRTA_ROUTES.length)})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-5 flex-1 w-full pb-20 sm:pb-8">
        
        {/* ======================= TAB 1: ROUTE & FARE SEARCH ======================= */}
        {activeTab === 'search' && (
          <div className="space-y-5">
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-6 transition-all hover:shadow-md">
              
              {/* Search Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">{t.searchModeLabel}</span>
                  <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => {
                        setSearchMode('by_route');
                        handleSearch(fromStop, toStop, selectedRouteId);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        searchMode === 'by_route'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.modeByRoute}
                    </button>
                    <button
                      onClick={() => {
                        setSearchMode('all_stops');
                        handleSearch(fromStop, toStop, null);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        searchMode === 'all_stops'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.modeAllStops}
                    </button>
                  </div>
                </div>

                {searchMode === 'by_route' && (
                  <button
                    onClick={() => setShowMatrixModal(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                  >
                    <Table className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.viewChartTableBtn}</span>
                  </button>
                )}
              </div>

              {/* Mode 1: Searchable Route DDL */}
              {searchMode === 'by_route' && (
                <div className="mb-4 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80">
                  <SearchableSelect
                    label={t.selectRouteLabel}
                    value={selectedRouteId}
                    onChange={(val) => handleRouteChange(val)}
                    options={routeOptions}
                    placeholder={t.selectRoutePlaceholder}
                    icon={RouteIcon}
                    lang={lang}
                  />

                  {/* Route details mini bar */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-800">{t.totalDistance}</span> {fmtNum(currentRoute.totalKm)} {t.kmUnit} •{' '}
                      <span className="font-semibold text-slate-800">{t.stopsLabel}</span> {fmtNum(currentRoute.stops.length)} {t.itemsCount}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-slate-800">{t.busesLabel}</span>
                      {currentRoute.buses.map((b, i) => (
                        <span key={i} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-medium">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* From & To Searchable Dropdowns (DDLs) */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                {/* From Input (Searchable DDL with English/Bangla search) */}
                <div className="relative">
                  <SearchableSelect
                    label={t.fromLabel}
                    value={fromStop}
                    onChange={(val) => {
                      setFromStop(val);
                      handleSearch(val, toStop, searchMode === 'by_route' ? selectedRouteId : null);
                    }}
                    options={searchMode === 'by_route' ? routeStopOptions : allDhakaStopOptions}
                    placeholder={t.fromPlaceholder}
                    icon={MapPin}
                    lang={lang}
                  />
                </div>

                {/* Swap Button */}
                <div className="flex justify-center pt-2 md:pt-5">
                  <button
                    onClick={handleSwapStops}
                    title={t.swapTooltip}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition border border-slate-200 hover:border-emerald-300 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Input (Searchable DDL with English/Bangla search) */}
                <div className="relative">
                  <SearchableSelect
                    label={t.toLabel}
                    value={toStop}
                    onChange={(val) => {
                      setToStop(val);
                      handleSearch(fromStop, val, searchMode === 'by_route' ? selectedRouteId : null);
                    }}
                    options={searchMode === 'by_route' ? routeStopOptions : allDhakaStopOptions}
                    placeholder={t.toPlaceholder}
                    icon={MapPin}
                    lang={lang}
                  />
                </div>
              </div>

              {/* Recent Searches Chips */}
              {recentSearches && recentSearches.length > 0 && (
                <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <History className="w-3 h-3 text-slate-400" />
                    {t.recentSearchesTitle}
                  </span>
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFromStop(item.from);
                        setToStop(item.to);
                        handleSearch(item.from, item.to, null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold border border-slate-200/80 hover:border-emerald-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.from}</span>
                      <span className="text-slate-400">➔</span>
                      <span>{item.to}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleClearRecent}
                    className="text-[10px] text-slate-400 hover:text-red-500 underline ml-1 cursor-pointer"
                  >
                    {t.clearRecentBtn}
                  </button>
                </div>
              )}

              {/* Action Information */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  <span>{t.searchTip}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSearch(fromStop, toStop, searchMode === 'by_route' ? selectedRouteId : null)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    {t.searchBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results Display */}
            {searchResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
                {/* Result Status Banner */}
                {searchResult.type === 'OFFICIAL_PDF' ? (
                  <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-emerald-900">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t.officialPdfVerified}
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded text-xs font-mono font-bold">
                      {searchResult.routes[0]?.routeCode}
                    </span>
                  </div>
                ) : searchResult.type === 'TRANSFER_ROUTE' ? (
                  <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-indigo-950">
                    <span className="flex items-center gap-1.5 font-bold">
                      <GitFork className="w-4 h-4 text-indigo-600 shrink-0" />
                      {t.transferBadge}
                    </span>
                    <span className="bg-indigo-200/90 text-indigo-950 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {t.transferHubLabel} {searchResult.transferHub}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 text-xs sm:text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold block sm:inline">
                          {t.autoCalculatedBanner}
                        </span>{' '}
                        {searchResult.notes}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  {/* Big Fare & Distance Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center items-center">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">{t.officialGovFare}</div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 mt-1">
                        {t.currency} {fmtNum(displayFare)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.minFareNote}</div>
                    </div>

                    <div className="border-y sm:border-y-0 sm:border-x border-slate-200 py-3 sm:py-0">
                      <div className="text-xs text-slate-500 font-semibold">{t.totalDistLabel}</div>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                        {fmtNum(displayDistance)} <span className="text-sm font-normal text-slate-600">{t.kmUnit}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.fareRateNote}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 font-semibold">{t.travelRouteLabel}</div>
                      
                      {/* Bilingual route display */}
                      {lang === 'en' ? (
                        <div className="mt-1">
                          <div className="text-sm font-bold text-slate-800">
                            {searchResult.fromEn || searchResult.from} ➔ {searchResult.toEn || searchResult.to}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {searchResult.from} ➔ {searchResult.to}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <div className="text-sm font-bold text-slate-800">
                            {searchResult.from} ➔ {searchResult.to}
                          </div>
                          {(searchResult.fromEn || searchResult.toEn) && (
                            <div className="text-xs text-slate-500 font-medium">
                              {searchResult.fromEn} ➔ {searchResult.toEn}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {searchResult.type === 'OFFICIAL_PDF' 
                          ? t.officialApprovedBadge 
                          : searchResult.type === 'TRANSFER_ROUTE' 
                          ? t.transferBadge 
                          : t.connectingEstimatedBadge}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Hop Connecting Journey Steps */}
                  {searchResult.type === 'TRANSFER_ROUTE' && searchResult.bestTransfer && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                          {lang === 'en' ? 'Step-by-Step Connecting Journey' : 'ধাপে ধাপে ভ্রমণের বিবরণ (১টি স্টপে বাস পরিবর্তন)'}
                        </h4>
                        <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                          {t.transferHubLabel} {searchResult.bestTransfer.hub}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Leg 1 */}
                        <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                              {t.leg1Label} {searchResult.bestTransfer.leg1.fromStop} ➔ {searchResult.bestTransfer.hub}
                            </span>
                            <span className="font-extrabold text-emerald-700">
                              {t.currency} {fmtNum(searchResult.bestTransfer.leg1.fare)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {fmtNum(searchResult.bestTransfer.leg1.distanceKm)} {t.kmUnit} • {searchResult.bestTransfer.leg1.routeCode} ({searchResult.bestTransfer.leg1.routeTitle})
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {searchResult.bestTransfer.leg1.buses.slice(0, 4).map((b, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Leg 2 */}
                        <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                              {t.leg2Label} {searchResult.bestTransfer.hub} ➔ {searchResult.bestTransfer.leg2.toStop}
                            </span>
                            <span className="font-extrabold text-emerald-700">
                              {t.currency} {fmtNum(searchResult.bestTransfer.leg2.fare)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {fmtNum(searchResult.bestTransfer.leg2.distanceKm)} {t.kmUnit} • {searchResult.bestTransfer.leg2.routeCode} ({searchResult.bestTransfer.leg2.routeTitle})
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {searchResult.bestTransfer.leg2.buses.slice(0, 4).map((b, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commuter Action Buttons (Copy, Share, Helpline) */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyFare}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        {t.copyFareBtn}
                      </button>
                      <button
                        onClick={handleShareFare}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        {t.shareFareBtn}
                      </button>
                    </div>

                    <button
                      onClick={() => setShowHelplineModal(true)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                      {t.brtaHelplineBtn}
                    </button>
                  </div>

                  {/* Real-time KM Adjuster */}
                  <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-dashed border-slate-300">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {t.kmAdjustPrompt}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newKm = Math.max(0.5, Number(((displayDistance) - 0.5).toFixed(1)));
                            setCustomAdjustedKm(newKm);
                          }}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={displayDistance}
                          onChange={(e) => setCustomAdjustedKm(parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg"
                        />
                        <span className="text-xs text-slate-500 font-medium">{t.kmUnit}</span>

                        <button
                          onClick={() => {
                            const newKm = Number(((displayDistance) + 0.5).toFixed(1));
                            setCustomAdjustedKm(newKm);
                          }}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>

                        {customAdjustedKm !== null && (
                          <button
                            onClick={() => setCustomAdjustedKm(null)}
                            className="text-xs text-emerald-700 hover:underline ml-2 font-medium cursor-pointer"
                          >
                            {t.resetBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Available Buses Section */}
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <Bus className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t.busesRunningTitle}
                    </h3>

                    {searchResult.allBuses && searchResult.allBuses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {searchResult.allBuses.map((bus, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            {bus}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        {t.noBusesNotice}
                      </div>
                    )}
                  </div>

                  {/* Matching routes breakdown */}
                  {searchResult.routes && searchResult.routes.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {t.relatedRoutesTitle} ({fmtNum(searchResult.routes.length)} {t.itemsCount})
                        </h4>
                        {searchMode === 'by_route' && (
                          <button
                            onClick={() => setShowMatrixModal(true)}
                            className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Table className="w-3.5 h-3.5 shrink-0" />
                            {t.viewFullMatrixLink}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {searchResult.routes.map((rt, i) => (
                          <div 
                            key={i}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  {rt.routeCode}
                                </span>
                                <span className="text-xs font-semibold text-slate-800">
                                  {rt.routeTitle || rt.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {rt.via ? `${t.viaPrefix} ${rt.via}` : `${rt.fromStop} ➔ ${rt.toStop}`}
                              </p>
                            </div>
                            <div className="text-right text-xs shrink-0 font-medium text-slate-700">
                              <span className="font-bold text-emerald-700">{t.currency} {fmtNum(rt.fare)}</span> • {t.chartPageNo} {fmtNum(rt.pageNo)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: DIRECT KM CALCULATOR ======================= */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-7 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600 shrink-0" />
                {t.calcTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.calcSubtitle}
              </p>
            </div>

            {/* KM Slider & Input */}
            <div className="space-y-4 max-w-lg">
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>{t.calcSetDist}</span>
                  <span className="text-emerald-700 font-bold text-base">
                    {fmtNum(calcKm)} {t.kmUnit}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0.5"
                  max="60"
                  step="0.5"
                  value={calcKm}
                  onChange={(e) => setCalcKm(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>{fmtNum(0.5)} {t.kmUnit}</span>
                  <span>{fmtNum(15)} {t.kmUnit}</span>
                  <span>{fmtNum(30)} {t.kmUnit}</span>
                  <span>{fmtNum(60)} {t.kmUnit}</span>
                </div>
              </div>

              {/* Direct numeric input */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-semibold text-slate-600">{t.calcEnterKm}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcKm}
                  onChange={(e) => setCalcKm(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500">{t.kmUnit}</span>
              </div>
            </div>

            {/* Calculated Fare Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                {t.calcGovFareHeader}
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-800 my-2">
                {t.currency} {fmtNum(calculateBrtaFareFromKm(calcKm))}
              </div>

              {/* Calculation explanation */}
              <div className="text-xs text-slate-600 space-y-1 mt-3 border-t border-emerald-200/60 pt-3">
                <div className="flex items-center justify-between">
                  <span>{t.calcFormulaLabel}</span>
                  <span className="font-mono font-medium">
                    {fmtNum(calcKm)} {t.calcFormulaText} {t.currency} {fmtNum((calcKm * 2.70).toFixed(2))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.calcMinFareLabel}</span>
                  <span className="font-medium">
                    {calcKm * 2.70 < 10 
                      ? t.calcMinFareApplied 
                      : t.calcNormalRounding}
                  </span>
                </div>
              </div>
            </div>

            {/* Rules Alert Note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>{t.noticeTitle}</strong>
                <p className="mt-0.5">
                  {t.notice1}
                  <br />
                  {t.notice2}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: BUS DIRECTORY ======================= */}
        {activeTab === 'buses' && (
          <div className="space-y-4">
            {/* Search filter for bus names */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 shrink-0" />
                <input
                  type="text"
                  value={busSearchQuery}
                  onChange={(e) => setBusSearchQuery(e.target.value)}
                  placeholder={t.busSearchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bus Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBuses.map((busItem, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                        <Bus className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {busItem.busName}
                      </h3>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                      {fmtNum(busItem.routes.length)} {t.routesCountSuffix}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {busItem.routes.map((rt, rIdx) => (
                      <div 
                        key={rIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-emerald-700">{rt.routeCode}: {rt.title}</span>
                          <span className="text-slate-500">{fmtNum(rt.totalKm)} {t.kmUnit}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{t.viaPrefix} {rt.via}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: PDF BRTA ROUTE CHARTS ======================= */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                {t.pdfChartsTitle}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                {t.pdfChartsSubtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_BRTA_ROUTES.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteDetail(route)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {route.routeCode}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {t.pagePrefix} {fmtNum(route.pageNo)}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-1">
                        {route.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {t.totalDistance} {fmtNum(route.totalKm)} {t.kmUnit} • {t.stopsLabel} {fmtNum(route.stops.length)} {t.itemsCount}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal for viewing route stops */}
            {selectedRouteDetail && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
                    <div>
                      <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
                        {selectedRouteDetail.routeCode} ({t.pagePrefix} {fmtNum(selectedRouteDetail.pageNo)})
                      </span>
                      <h3 className="text-base font-bold mt-1">
                        {selectedRouteDetail.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedRouteDetail(null)}
                      className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t.operatingBuses}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRouteDetail.buses.map((b, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t.stopsAndDistanceList}
                      </h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {selectedRouteDetail.stops.map((st, i) => {
                          const enName = getStopEnglishName(st.name);
                          return (
                            <div key={i} className="px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {fmtNum(i + 1)}
                                </span>
                                <div>
                                  <span className="font-medium text-slate-800 block">
                                    {lang === 'en' ? enName : st.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {lang === 'en' ? st.name : enName}
                                  </span>
                                </div>
                              </span>
                              <span className="font-mono text-slate-500 shrink-0">
                                {fmtNum(st.km)} {t.kmUnit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
                    <button
                      onClick={() => setSelectedRouteDetail(null)}
                      className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {t.closeBtn}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Triangular Matrix Modal (Exact replicate of PDF Fare Chart Table) */}
      {showMatrixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
              <div>
                <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                  {currentRoute.routeCode} ({t.pagePrefix} {fmtNum(currentRoute.pageNo)})
                </span>
                <h3 className="text-sm sm:text-base font-bold mt-1">
                  {currentRoute.title} — {t.matrixModalSubtitle}
                </h3>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              <div className="text-xs text-slate-500 mb-2">
                {t.matrixModalNote}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2.5 py-2 text-left font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                        {t.colStop}
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                        {t.colKm}
                      </th>
                      {currentRoute.stops.map((st, idx) => {
                        const enName = getStopEnglishName(st.name);
                        return (
                          <th key={idx} className="px-2 py-2 text-center font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            <div>{lang === 'en' ? enName : st.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {lang === 'en' ? st.name : enName}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentRouteMatrix.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/80">
                        <td className="px-2.5 py-2 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap bg-slate-50/50">
                          <div>{lang === 'en' ? (row.stopEn || row.stop.name) : row.stop.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {lang === 'en' ? row.stop.name : row.stopEn}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-slate-600 border-r border-slate-200 bg-slate-50/50 whitespace-nowrap">
                          {fmtNum(row.stop.km)}
                        </td>
                        {row.fares.map((cell, colIdx) => {
                          if (cell.isDiagonal) {
                            return (
                              <td key={colIdx} className="px-2 py-2 text-center font-bold bg-emerald-50 text-emerald-800 border-r border-slate-200 whitespace-nowrap">
                                <div>{lang === 'en' ? (cell.fromEn || cell.from) : cell.from}</div>
                                <div className="text-[10px] text-emerald-600 font-normal">
                                  {lang === 'en' ? cell.from : cell.fromEn}
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td 
                              key={colIdx} 
                              onClick={() => {
                                setFromStop(cell.from);
                                setToStop(cell.to);
                                handleSearch(cell.from, cell.to, currentRoute.id);
                                setShowMatrixModal(false);
                              }}
                              className="px-2 py-2 text-center font-mono font-bold text-slate-800 border-r border-slate-200 hover:bg-emerald-100 cursor-pointer transition whitespace-nowrap"
                              title={`${cell.from} (${cell.fromEn}) ➔ ${cell.to} (${cell.toEn}): ${t.currency} ${fmtNum(cell.fare)} (${fmtNum(cell.distance)} ${t.kmUnit})`}
                            >
                              {fmtNum(cell.fare)}{lang === 'bn' ? '.০০' : '.00'}
                            </td>
                          );
                        })}
                        {/* Fill the remaining empty cells */}
                        {Array.from({ length: currentRoute.stops.length - row.fares.length }).map((_, emptyIdx) => (
                          <td key={emptyIdx} className="bg-slate-50/30 border-r border-slate-200"></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div>
                {t.matrixFooterRate}
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BRTA Helpline & Overcharge Complaint Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm sm:text-base">
                <PhoneCall className="w-5 h-5 text-red-600" />
                {lang === 'en' ? 'BRTA Complaint Hotline' : 'বিআরটিএ যাত্রী সহায়তা ও অভিযোগ হটলাইন'}
              </div>
              <button onClick={() => setShowHelplineModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                {t.brtaHelplineTitle}
              </p>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-red-900">{lang === 'en' ? 'Toll-free Hotline:' : 'হটলাইন নম্বর:'}</span>
                  <a href="tel:16107" className="font-bold text-red-700 bg-white px-3 py-1 rounded-lg border border-red-300 hover:bg-red-100 transition shadow-xs">
                    ১৬১০৭ (16107)
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-red-900">{lang === 'en' ? 'Headquarters Landline:' : 'সদর দপ্তর ফোন:'}</span>
                  <a href="tel:0255040716" className="font-mono font-semibold text-slate-800 hover:underline">
                    02-55040716
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                <span className="font-bold text-slate-800 block">{lang === 'en' ? 'Required details to report:' : 'অভিযোগ করার সময় যা যা জানাবেন:'}</span>
                <div>• বাসের রেজিস্ট্রেশন নম্বর (যেমন: ঢাকা মেট্রো ব-১১-XXXX)</div>
                <div>• বাসের নাম ও রুট (যেমন: শিকড় / প্রজাপতি)</div>
                <div>• অতিরিক্ত দাবিকৃত ভাড়া ও যাত্রা শুরুর/গন্তব্য স্থান</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelplineModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Capacitor / Android Ready) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
            activeTab === 'search' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>{lang === 'en' ? 'Search' : 'সার্চ'}</span>
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
            activeTab === 'calculator' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span>{lang === 'en' ? 'KM Calc' : 'ক্যালকুলেটর'}</span>
        </button>
        <button
          onClick={() => setActiveTab('buses')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
            activeTab === 'buses' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Bus className="w-4 h-4 mb-0.5" />
          <span>{lang === 'en' ? 'Buses' : 'বাস তালিকা'}</span>
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
            activeTab === 'charts' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>{lang === 'en' ? '116 Charts' : '১১৬ চার্ট'}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-8 hidden sm:block">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            {t.footerTitle}
          </div>
          <div className="text-emerald-700 font-semibold">
            {t.footerRate}
          </div>
        </div>
      </footer>
    </div>
  );
}
