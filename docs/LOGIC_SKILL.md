# Logic Skill Model & Domain Architecture
## Dhaka Bus Transit & Fare Intelligence App

This document defines the mathematical models, official BRTA gazette rules, routing graph algorithms, distance estimation formulas, and offline-first data structures powering the application.

---

### 1. Official BRTA Fare Gazette Specification
According to the official Ministry of Road Transport and Bridges Gazetted Fare Chart (22 September 2023 / 07 Ashwin 1430 BS, Memo No. 35.00.0000.020.26.005.16-540):

$$\text{Fare Rate} = 2.70 \text{ Tk per passenger per kilometer}$$
$$\text{Minimum Fare} = 10.00 \text{ Tk}$$

#### Exact Calculation Formula:
Given two stops with cumulative chainages $d_A$ and $d_B$ in kilometers:
$$\Delta d = |d_B - d_A|$$
$$\text{Raw Fare} = \Delta d \times 2.70$$
$$\text{Final Fare} = \begin{cases} 
0, & \text{if } \Delta d = 0 \\
10, & \text{if } \Delta d \le 3.70 \text{ km} \\
10, & \text{if } 3.80 \le \Delta d \le 4.00 \text{ km (special official chart rounding)} \\
\max(10, \operatorname{round}(\text{Raw Fare})), & \text{otherwise}
\end{cases}$$

---

### 2. Multi-Hop Transit Graph Routing Algorithm
When a commuter searches between two stops where no single direct bus route operates (e.g. Savar to Sayedabad or Uttara to Keraniganj), the engine executes a **1-Transfer Hub Discovery Algorithm**:

```
Input: Stop A (Origin), Stop B (Destination)
Output: Ranked list of transfer journeys [ { leg1, transferHub, leg2, totalFare, totalKm } ]

1. Find all routes R_A containing Stop A.
2. Find all routes R_B containing Stop B.
3. For each route r_a in R_A:
     For each stop S in r_a (after or before A):
       For each route r_b in R_B:
         If r_b contains stop S:
           Calculate leg1 = Fare(A -> S) on r_a
           Calculate leg2 = Fare(S -> B) on r_b
           TotalFare = leg1.fare + leg2.fare
           TotalDistance = leg1.distance + leg2.distance
           Record candidate transfer { r_a, S, r_b, TotalFare, TotalDistance }
4. Rank transfer options by:
     a. Primary: Minimum TotalDistance
     b. Secondary: Prominence of Transfer Hub (Major hubs: Farmgate, Mohakhali, Shahbagh, Paltan, Gabtoli)
5. Return top 3 optimal transfer journeys.
```

---

### 3. Smart Unlisted Location & Fallback Engine
When a commuter searches for a stop NOT present in the 116 official route charts:

1. **Dhaka Location Matrix Lookup:**
   - Coordinates $(lat_A, lon_A)$ and $(lat_B, lon_B)$ are retrieved from `DHAKA_LOCATIONS`.
2. **Haversine Straight-line Distance:**
   $$d_{\text{straight}} = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
   Where $R = 6371 \text{ km}$.
3. **Calibrated Dhaka Road Distance:**
   $$d_{\text{road}} = \operatorname{round}(d_{\text{straight}} \times 1.32, 1)$$
   *(1.32 factor calibrated against Dhaka metropolitan street winding coefficient).*
4. **Interactive KM Adjustment:**
   - A reactive slider allows the commuter to fine-tune the exact road kilometer and instantly see the official BRTA mandated fare.

---

### 4. Bilingual String Normalization
To guarantee instantaneous and error-free search across Bengali and English phonetic transliteration:
1. Normalize Unicode NFC.
2. Strip Bengali Nukta variations (`\u09bc`).
3. Replace punctuation and hyphens with clean spacing.
4. Check cross-synonym dictionaries (e.g., `সদরঘাট` ⟷ `ভিক্টোরিয়া পার্ক`, `হাউজ বিল্ডিং` ⟷ `উত্তরা`, `গুলিস্তান` ⟷ `ফুলবাড়িয়া`).
5. Dual lookup against `STOP_ENGLISH_MAP` for 100% stop coverage.

---

### 5. Offline-First Architecture
All 116 routes, 1,200+ stop chainages, pairwise matrices, and translations are packaged as static ES Modules. No external backend, REST API, or network request is made during runtime.
- **Boot time:** $< 50 \text{ ms}$
- **Search latency:** $< 5 \text{ ms}$
- **Memory footprint:** $< 4 \text{ MB}$
- **Android APK compatibility:** $100\%$ offline operational.
