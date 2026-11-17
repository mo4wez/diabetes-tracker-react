# دفترچه پایش دیابت (Diabetes Tracker)

A full-stack, Persian (Jalali) first web application built with **React**, **Vite**, **styled-components**, and **Supabase** for daily blood glucose monitoring, basal/bolus insulin logging, printable monthly medical reports, and periodic lab/eye checkup tracking.

---

## Key Features

- **7-Day Persian Weekly Tracker (`/`)**
  - Saturday-to-Friday Jalali week navigation powered by `dayjs` and `jalaliday`.
  - Inline logging for morning fasting blood glucose (`6–8 AM`), midnight basal insulin (`Lantus`), and main meals (`Breakfast`, `Lunch`, `Dinner`) with `NovoRapid` doses, food descriptions, and 2-hour post-meal glucose readings.
  - Optional snack & correction dose (`میان‌وعده / دوز اصلاحی`) slots and daily activity/stress notes.
  - Color-coded glucose indicators (`Low < 70`, `Target`, `Elevated`, `High`) adapting automatically between light and dark themes.
  - Automatic upcoming checkup alert banner for due or overdue HbA1c and retinal eye exams.

- **Printable Monthly Doctor Report (`/report`)**
  - Full Persian month logbook table with clinical summary KPIs: **Average Fasting BG**, **Average 2-Hour Post-Meal BG**, **Estimated HbA1c (eA1c / GMI)**, **Average Daily Insulin**, and **Hypoglycemia Count (`< 70 mg/dL`)**.
  - Visual **Time-in-Range (TIR)** breakdown (`70–180 mg/dL` target vs. high vs. low).
  - Interactive **Recharts** multi-line trend chart with clinical reference lines (`70` and `180 mg/dL`).
  - Print-optimized `@media print` stylesheet that automatically switches to crisp light-mode colors for A4 printing even when night mode is active on screen.

- **Periodic Checkups & Lab Archive (`/checkups`)**
  - Automated next-due-date calculation and countdown badges for 3-month **HbA1c** tests, annual **retinal eye exams**, and 6-month **kidney/lipid panels** using Jalali date inputs.
  - Secure private **Supabase Storage** (`checkup-files`) attachments for lab PDFs and exam images with temporary signed URL previews.

- **Night Mode & Security**
  - Persistent light/dark theme toggle with isolated `styled-components` theming.
  - Authenticated access protected by **Supabase Auth** and **PostgreSQL Row Level Security (RLS)**.

---

## Tech Stack

- **Frontend:** React 19, Vite, React Router, styled-components, Lucide React
- **State & Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Charts & Dates:** Recharts, Day.js + `jalaliday`
- **Backend & Storage:** Supabase (PostgreSQL, Auth, Row Level Security, Private Storage)
- **Hosting:** Cloudflare Workers (Static Assets)

---

## Project Structure

```text
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── layout/
│   │   └── AppLayout.jsx
│   └── tracker/
│       ├── CheckupAlertBanner.jsx
│       ├── DayCard.jsx
│       └── MealSlotRow.jsx
├── context/
│   └── ThemeModeContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCheckups.js
│   ├── useLogMutations.js
│   ├── useMonthlyLogs.js
│   └── useWeeklyLogs.js
├── lib/
│   ├── persianDate.js
│   └── supabase.js
├── pages/
│   ├── CheckupsPage.jsx
│   ├── LoginPage.jsx
│   ├── MonthlyReportPage.jsx
│   └── WeeklyTrackerPage.jsx
├── styles/
│   ├── GlobalStyles.js
│   └── theme.js
├── App.jsx
└── main.jsx
```
