# Style Skill Model & Design System
## Dhaka Bus Transit & Fare Intelligence App (Web & Android Ready)

This document establishes the official visual identity, styling principles, typography, layout tokens, and UI/UX standards for the Dhaka Bus Fare application.

---

### 1. Visual Identity & Color Palette
The color system is tailored for high legibility under bright sunlight (common for Dhaka commuters waiting at bus stops) and mobile screens:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Transit (Emerald 900)** | `#064e3b` | Header bar, primary brand identity, active dark badges |
| **Brand Accent (Emerald 600)** | `#059669` | Primary action buttons, selection indicators, key accents |
| **Light Tint (Emerald 50)** | `#ecfdf5` | Highlighted rows, active pill backgrounds, success states |
| **Surface Dark (Slate 900)** | `#0f172a` | Text primary, high-contrast modal headers |
| **Surface Muted (Slate 500)** | `#64748b` | Secondary descriptions, English subtitles |
| **Card Background** | `#ffffff` | Elevated cards, dropdown menus, modals |
| **Surface Border (Slate 200)** | `#e2e8f0` | Dividers, subtle borders with 1px border-radius |
| **Warning / Alert (Amber 600)** | `#d97706` | Unofficial/unlisted stop notifications, caution alerts |
| **Info / BRTA Rate (Sky 600)** | `#0284c7` | Official gazette notice badges, fare breakdown chips |

---

### 2. Typography & Bilingual Font Stack
To prevent broken Bengali glyphs, conjunct clipping (যুক্তবর্ণ), and inconsistent baseline rendering:

```css
font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', system-ui, -apple-system, sans-serif;
```

#### Typography Scale:
- **Display Large (Hero Fare):** `text-3xl sm:text-4xl font-extrabold tracking-tight`
- **Section Headers:** `text-lg sm:text-xl font-bold text-slate-800`
- **Subheadings & Route Titles:** `text-sm sm:text-base font-semibold text-slate-800`
- **Body & Stop Names:** `text-xs sm:text-sm text-slate-700`
- **Badges, KM & Aliases:** `text-[11px] sm:text-xs font-mono font-medium`

---

### 3. Mobile-First & Android Capacitor Design Rules
The web application is designed to be wrapped into an Android APK using **Capacitor**. The following rules must be strictly adhered to:

1. **Touch Targets:**
   - Every interactive element (buttons, dropdown items, swap icons, tab pills) must have a minimum touch boundary of **44px × 44px**.
2. **Bottom Navigation Bar on Mobile:**
   - On screens `< 640px` (smartphones), main navigation (Search, Calculator, Buses, Charts) is pinned to a floating/fixed bottom navigation bar for comfortable one-handed thumb navigation.
3. **Safe Area & Viewport Insets:**
   - CSS must support `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to accommodate Android status bars and gesture navigation bars.
4. **Modal & Bottom Sheet Transitions:**
   - Triangular fare matrix and route details open as a slide-up bottom sheet on mobile and centered modal on desktop.
5. **No Layout Shifts (CLS 0):**
   - Reserve space for search result cards so content does not violently jump when switching routes or calculation types.

---

### 4. Component Design Patterns
- **Searchable Dropdown (`SearchableSelect`):**
  - Instant keyboard filtering (both Bengali and English transliteration).
  - High-contrast selected state with Check icon.
  - "Custom Stop" option when query is unlisted.
- **Fare Display Hero Card:**
  - Distinct colored badge: Green for **অফিসিয়াল চার্ট (Official BRTA Gazette)** vs Amber for **দূরত্ব ভিত্তিক হিসাব (Estimated Road Distance)**.
  - Quick action buttons: **কপি করুন (Copy Fare)**, **শেয়ার করুন (Share)**, **অভিযোগ হেল্পলাইন (BRTA Helpline 16107)**.
- **Route Matrix Table:**
  - Sticky first column and header row.
  - Color gradient: 10 Tk min fare (light green) up to max fare (deep emerald).
