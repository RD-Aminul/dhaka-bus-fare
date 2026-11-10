// Comprehensive Bilingual Dictionary (Bangla & English)

export const TRANSLATIONS = {
  bn: {
    // Header
    appTitle: "ঢাকা বাস রুট ও আসল ভাড়া",
    appSubtitle: "বিআরটিএ অনুমোদিত প্রজ্ঞাপন চার্ট (বাংলা ও ইংরেজি উভয় ভাষায় সার্চ সাপোর্ট)",
    rateBadge: "২.৭০ ৳ / কিমি • সর্বনিম্ন ১০ ৳",
    
    // Tabs
    tabSearch: "রুট ও ভাড়া সার্চ",
    tabCalculator: "কিমি ভাড়া ক্যালকুলেটর",
    tabBuses: "বাসের তালিকা",
    tabCharts: "বিআরটিএ রুট চার্ট",
    
    // Search Modes
    searchModeLabel: "সার্চ মোড:",
    modeByRoute: "রুট নির্বাচন (সরাসরি আসল চার্ট)",
    modeAllStops: "যেকোনো স্টপ সার্চ",
    viewChartTableBtn: "পিডিএফ চার্ট ছক",
    
    // Route Dropdown
    selectRouteLabel: "বিআরটিএ রুট নির্বাচন করুন (নাম বা নম্বর লিখুন / Search Route):",
    selectRoutePlaceholder: "রুট নম্বর বা নাম লিখুন (e.g. 101, Mirpur, Motijheel)...",
    totalDistance: "মোট দূরত্ব:",
    stopsLabel: "স্টপ:",
    busesLabel: "বাস:",
    pagePrefix: "পেজ",
    viaPrefix: "ভায়া:",
    
    // From / To Dropdowns
    fromLabel: "শুরুর স্টপ (From Destination):",
    fromPlaceholder: "বাংলা বা ইংরেজিতে লিখুন (e.g. Mirpur বা মিরপুর)...",
    toLabel: "গন্তব্য স্টপ (To Destination):",
    toPlaceholder: "বাংলা বা ইংরেজিতে লিখুন (e.g. Farmgate বা ফার্মগেট)...",
    swapTooltip: "স্টপ অদল-বদল করুন",
    searchTip: "💡 ড্রপডাউনে ক্লিক করে ইংরেজি বা বাংলা টাইপ করলেই ফিল্টার হবে।",
    searchBtn: "ভাড়া ও বাস দেখুন",
    
    // Result Card
    officialPdfVerified: "বিআরটিএ প্রজ্ঞাপন চার্ট যাচাইকৃত আসল ভাড়া (Actual Fare)",
    autoCalculatedBanner: "স্বয়ংক্রিয় দূরত্ব ও ভাড়া হিসাব:",
    officialGovFare: "নির্ধারিত সরকারি আসল ভাড়া",
    minFareNote: "সর্বনিম্ন ভাড়া ১০.০০ টাকা",
    totalDistLabel: "মোট দূরত্ব",
    fareRateNote: "ভাড়ার হার ২.৭০ ৳ / কিমি",
    travelRouteLabel: "ভ্রমণ রুট",
    officialApprovedBadge: "অফিসিয়াল অনুমোদিত চার্ট",
    connectingEstimatedBadge: "কানেক্টিং / হিসেবকৃত",
    kmAdjustPrompt: "কিলোমিটার পরিবর্তন করে ভাড়া পুনঃহিসাব করতে চান?",
    resetBtn: "রিসেট",
    busesRunningTitle: "এই রুটে চলাচলকারী বাসসমূহ:",
    noBusesNotice: "লোকাল ও সিটিং সার্ভিস বাস",
    relatedRoutesTitle: "সংশ্লিষ্ট বিআরটিএ চার্ট ও মাধ্যম",
    viewFullMatrixLink: "সম্পূর্ণ চার্ট ছক দেখুন",
    chartPageNo: "চার্ট পেজ নং",
    
    // Calculator Tab
    calcTitle: "কিলোমিটার দিয়ে সরাসরি সরকারি বাস ভাড়া হিসেব",
    calcSubtitle: "যেসব মধ্যবর্তী স্টপ বা এলাকার নাম তালিকায় পাওয়া যায় না, সেখানে সঠিক দূরত্ব (কিলোমিটার) লিখে সরাসরি সরকারি প্রজ্ঞাপন অনুযায়ী আসল ভাড়া হিসেব করুন।",
    calcSetDist: "দূরত্ব নির্ধারণ করুন:",
    calcEnterKm: "কিলোমিটার লিখুন:",
    calcGovFareHeader: "বিআরটিএ রেট অনুযায়ী সরকারি আসল ভাড়া",
    calcFormulaLabel: "ফর্মুলা:",
    calcFormulaText: "কিমি × ২.৭০ টাকা =",
    calcMinFareLabel: "সর্বনিম্ন ভাড়া নীতি:",
    calcMinFareApplied: "১০ টাকার কম হওয়ায় সর্বনিম্ন ১০ টাকা প্রযোজ্য",
    calcNormalRounding: "স্বাভাবিক রাউন্ড ফিগার প্রযোজ্য",
    noticeTitle: "বিশেষ দ্রষ্টব্য (বিআরটিএ প্রজ্ঞাপন):",
    notice1: "(০১) সর্বনিম্ন ভাড়া ১০.০০ টাকা হিসাব করে এই চার্ট প্রস্তুত করা হয়েছে। তাই কোনো অবস্থায় এর চেয়ে বেশি অর্থ দাবি করা যাবে না।",
    notice2: "(০২) এ ভাড়ার হার ডিজেল চালিত বাসের জন্য। গ্যাস চালিত যানবাহনের ক্ষেত্রে প্রযোজ্য হবে না।",
    
    // Bus Directory Tab
    busSearchPlaceholder: "বাসের নাম বা রুটের স্থান দিয়ে খুঁজুন (যেমন: প্রজাপতি, শিকড়, বৈশাখী, তানজিল...)",
    routesCountSuffix: "টি রুট",
    
    // PDF Route Charts Tab
    pdfChartsTitle: "ঢাকা মেট্রো বিআরটিএ চার্টসমূহ (১১৬ পৃষ্ঠার পূর্ণাঙ্গ প্রজ্ঞাপন)",
    pdfChartsSubtitle: "বিআরটিএ যাত্রী ও পণ্য পরিবহন কমিটির অনুমোদিত অফিসিয়াল ভাড়ার চার্ট। যেকোনো রুটে ক্লিক করে স্টপেজ ও সম্পূর্ণ ভাড়ার ছক দেখুন।",
    operatingBuses: "চলাচলকারী বাসসমূহ",
    stopsAndDistanceList: "স্টপেজ ও দূরত্ব তালিকা",
    closeBtn: "বন্ধ করুন",
    
    // Matrix Modal
    matrixModalSubtitle: "সম্পূর্ণ অফিসিয়াল ভাড়ার চার্ট ছক",
    matrixModalNote: "* পিডিএফে যেভাবে ত্রিকোণাকার ছক থাকে, এটি হুবহু সেই টেবিল। যেকোনো ঘরের ওপর ক্লিক করে শুরুর ও গন্তব্য স্টপ হিসেবে নির্বাচন করতে পারেন।",
    colStop: "স্টপেজ (Stop)",
    colKm: "কিঃমিঃ",
    matrixFooterRate: "ভাড়ার হার: ২.৭০ টাকা/কিমি • সর্বনিম্ন ভাড়া: ১০.০০ টাকা",
    
    // Footer
    footerTitle: "ঢাকা মেট্রো ডিজেল চালিত বাস ভাড়ার চার্ট • বিআরটিএ প্রজ্ঞাপন চার্ট",
    footerRate: "সর্বনিম্ন ভাড়া: ৳ ১০.০০ | প্রতি কিমি ২.৭০ ৳",
    
    // Units
    currency: "৳",
    kmUnit: "কিমি",
    itemsCount: "টি",
    noStopFound: 'নামে কোনো স্টপ পাওয়া যায়নি',

    // Multi-Hop / Connecting Route
    transferBadge: "১টি স্টপে বাস পরিবর্তন (Connecting Route)",
    transferHubLabel: "বাস পরিবর্তনের স্থান (Transfer Hub):",
    leg1Label: "১ম ধাপ (Leg 1):",
    leg2Label: "২য় ধাপ (Leg 2):",
    combinedFareLabel: "মোট সংযুক্ত ভাড়া:",
    transferNotes: "সরাসরি কোনো বাস নেই, তবে ১টি স্টপে বাস পরিবর্তন করে সহজে যাওয়া যাবে।",

    // Action Buttons & Commuter Features
    copyFareBtn: "ভাড়া কপি করুন",
    fareCopiedToast: "ভাড়ার বিবরণ কপি করা হয়েছে!",
    shareFareBtn: "শেয়ার",
    brtaHelplineBtn: "বিআরটিএ হেল্পলাইন (১৬১০৭)",
    brtaHelplineTitle: "অতিরিক্ত ভাড়া দাবি করলে তাৎক্ষণিক অভিযোগ জানান:",
    recentSearchesTitle: "সাম্প্রতিক সার্চ:",
    clearRecentBtn: "মুছুন",
    customStopNotice: "কাস্টম স্টপ (দূরত্ব ভিত্তিক প্রজ্ঞাপন ভাড়া)"
  },
  
  en: {
    // Header
    appTitle: "Dhaka Bus Routes & Actual Fare",
    appSubtitle: "Official BRTA Gazette Fare Chart (Bilingual Search Support)",
    rateBadge: "2.70 Tk / km • Min Fare 10 Tk",
    
    // Tabs
    tabSearch: "Route & Fare Search",
    tabCalculator: "KM Fare Calculator",
    tabBuses: "Bus Directory",
    tabCharts: "BRTA Route Charts",
    
    // Search Modes
    searchModeLabel: "Search Mode:",
    modeByRoute: "Select Route (Official Chart)",
    modeAllStops: "Search Any Stop",
    viewChartTableBtn: "PDF Fare Matrix",
    
    // Route Dropdown
    selectRouteLabel: "Select BRTA Route (Type name or code):",
    selectRoutePlaceholder: "Type route number or name (e.g. 101, Mirpur, Motijheel)...",
    totalDistance: "Total Distance:",
    stopsLabel: "Stops:",
    busesLabel: "Buses:",
    pagePrefix: "Page",
    viaPrefix: "Via:",
    
    // From / To Dropdowns
    fromLabel: "Origin (From Destination):",
    fromPlaceholder: "Type in English or Bangla (e.g. Mirpur or মিরপুর)...",
    toLabel: "Destination (To Destination):",
    toPlaceholder: "Type in English or Bangla (e.g. Farmgate or ফার্মগেট)...",
    swapTooltip: "Swap origin & destination",
    searchTip: "💡 Click dropdown and type in English or Bangla to filter instantly.",
    searchBtn: "View Fare & Buses",
    
    // Result Card
    officialPdfVerified: "BRTA Official Chart Verified Actual Fare",
    autoCalculatedBanner: "Auto Calculated Distance & Fare:",
    officialGovFare: "Official Government Actual Fare",
    minFareNote: "Minimum fare is 10.00 Tk",
    totalDistLabel: "Total Distance",
    fareRateNote: "Fare Rate: 2.70 Tk / km",
    travelRouteLabel: "Travel Route",
    officialApprovedBadge: "Official Approved Chart",
    connectingEstimatedBadge: "Connecting / Estimated",
    kmAdjustPrompt: "Want to adjust KM and recalculate fare?",
    resetBtn: "Reset",
    busesRunningTitle: "Buses running on this route:",
    noBusesNotice: "Local & Sitting Service Buses",
    relatedRoutesTitle: "Related BRTA Charts & Routes",
    viewFullMatrixLink: "View Full Chart Table",
    chartPageNo: "Chart Page No.",
    
    // Calculator Tab
    calcTitle: "Direct Bus Fare Calculation by Kilometers",
    calcSubtitle: "For intermediate stops or areas not in the official list, enter the exact distance (km) to calculate actual government fare according to the official BRTA gazette.",
    calcSetDist: "Set Distance:",
    calcEnterKm: "Enter KM:",
    calcGovFareHeader: "Official Government Fare per BRTA Rate",
    calcFormulaLabel: "Formula:",
    calcFormulaText: "km × 2.70 Tk =",
    calcMinFareLabel: "Min Fare Policy:",
    calcMinFareApplied: "Less than 10 Tk, so minimum 10 Tk applied",
    calcNormalRounding: "Standard rounded figure applied",
    noticeTitle: "Important Notice (BRTA Gazette):",
    notice1: "(01) This chart is calculated with a minimum fare of 10.00 Tk. Under no circumstances can a higher fare be demanded.",
    notice2: "(02) This fare rate is for diesel-run buses only. Not applicable for CNG/gas-run vehicles.",
    
    // Bus Directory Tab
    busSearchPlaceholder: "Search by bus name or route stops (e.g. Projapoti, Shikor, Baishakhi...)",
    routesCountSuffix: "routes",
    
    // PDF Route Charts Tab
    pdfChartsTitle: "Dhaka Metro BRTA Charts (Full 116-Page Gazette)",
    pdfChartsSubtitle: "Official fare chart approved by BRTA Passenger & Goods Transport Committee. Click any route to view stops and complete fare matrix.",
    operatingBuses: "Operating Buses",
    stopsAndDistanceList: "Stops & Distance List",
    closeBtn: "Close",
    
    // Matrix Modal
    matrixModalSubtitle: "Full Official Fare Matrix Chart",
    matrixModalNote: "* This table exactly replicates the triangular fare matrix in the official BRTA PDF. Click any cell to select that segment as From & To stops.",
    colStop: "Stop (স্টপেজ)",
    colKm: "KM",
    matrixFooterRate: "Fare Rate: 2.70 Tk/km • Minimum Fare: 10.00 Tk",
    
    // Footer
    footerTitle: "Dhaka Metro Diesel Bus Fare Chart • BRTA Official Gazette Chart",
    footerRate: "Minimum Fare: Tk 10.00 | Rate: 2.70 Tk/km",
    
    // Units
    currency: "Tk",
    kmUnit: "km",
    itemsCount: "stops",
    noStopFound: "No stops found matching",

    // Multi-Hop / Connecting Route
    transferBadge: "1-Stop Transfer (Connecting Route)",
    transferHubLabel: "Transfer At (Connecting Hub):",
    leg1Label: "Leg 1:",
    leg2Label: "Leg 2:",
    combinedFareLabel: "Total Combined Fare:",
    transferNotes: "No direct bus found, but easily reachable with 1 bus change.",

    // Action Buttons & Commuter Features
    copyFareBtn: "Copy Fare",
    fareCopiedToast: "Fare details copied to clipboard!",
    shareFareBtn: "Share",
    brtaHelplineBtn: "BRTA Helpline (16107)",
    brtaHelplineTitle: "Report overcharging immediately to BRTA:",
    recentSearchesTitle: "Recent Searches:",
    clearRecentBtn: "Clear",
    customStopNotice: "Custom Stop (Distance-Based Gazette Fare)"
  }
};
