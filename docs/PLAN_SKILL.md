# Plan Skill Model & Execution Roadmap
## Dhaka Bus Transit & Fare Intelligence App

This document outlines the product lifecycle, feature specifications, architecture phases, and deployment roadmap for transitioning from web application to Android APK.

---

### Phase 1: Web Application Perfection (Current Milestone)
- [x] Extract and digitize all 116 BRTA official route charts with cumulative chainages.
- [x] Official gazette triangular fare matrix generation for all 116 routes.
- [x] Bilingual interface (Bangla & English) with toggle and search transliteration.
- [x] Exact BRTA fare calculations ($2.70 \text{ Tk/km}$, min $10 \text{ Tk}$).
- [x] Custom / Unlisted Dhaka stop search with automatic road distance estimation.
- [ ] **Multi-Hop Connecting Bus Finder:** Suggest 1-transfer journeys when no direct bus exists.
- [ ] **Custom Stop Typing in DDL:** Allow typing any arbitrary location not in catalog.
- [ ] **Recent Searches & Favorite Routes:** Saved in browser `localStorage`.
- [ ] **Share & Copy Fare Summary:** Quick copy for conductors and commuters.
- [ ] **Mobile-Optimized Bottom Navigation:** Seamless mobile user experience.

---

### Phase 2: Android Native Packaging via Capacitor
When the user is ready to build the Android application:

#### Setup Steps:
```bash
# 1. Install Capacitor Core & CLI
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# 2. Initialize Capacitor Project
npx cap init "Dhaka Bus Fare" "com.aminul.dhakabusfare" --web-dir=dist

# 3. Add Android Platform
npx cap add android

# 4. Build Vite Web Assets
npm run build

# 5. Sync Assets with Android Project
npx cap sync android

# 6. Open in Android Studio & Generate APK
npx cap open android
```

#### Native Android Enhancements to Configure:
1. **Status Bar & Navigation Bar Theming:**
   - Dark green status bar (`#064e3b`) matching header.
2. **Back Button Handling:**
   - Hardware back button on Android closes open modals (matrix modal, bottom sheets) instead of exiting app.
3. **Offline Splash Screen & App Icon:**
   - Crisp Dhaka Bus icon and emerald splash screen.
4. **Zero-Network Capability:**
   - Ensure `dist/` contains all assets so the app works 100% without internet.

---

### Phase 3: Commuter Protection & Community Features
- [ ] **BRTA Helpline 16107 / 02-55040716:** 1-tap direct dial for overcharging complaints.
- [ ] **Overcharge Calculator:** Enter what the conductor demanded vs official fare to see overcharged amount.
- [ ] **Print / Save PDF Receipt:** Generate a small verifiable fare receipt.
- [ ] **PWA Offline Manifest:** Allow "Add to Home Screen" directly from Chrome without installing APK.

---

### Phase 4: Release & Verification Checklist
| Checkpoint | Target | Status |
| :--- | :--- | :--- |
| Route Coverage | 116 / 116 routes | Completed |
| Language Support | 100% Bilingual (BN / EN) | Completed |
| Unlisted Location Engine | Automatic road KM calculation | Completed |
| Multi-hop Connecting Routes | 1-transfer routing algorithm | In Progress |
| Mobile Responsive UX | Touch targets $\ge 44\text{px}$, bottom bar | In Progress |
| Production Build Size | $< 500 \text{ KB}$ gzipped | Verified |
