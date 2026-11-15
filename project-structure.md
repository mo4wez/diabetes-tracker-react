src/
├── lib/
│ ├── supabase.js # Initializes Supabase client using VITE\_ env variables
│ └── persianDate.js # Helper functions: getPersianWeekDays(), formatJalali(), etc.
├── styles/
│ ├── theme.js # Colors (glucose status colors!), spacing, fonts, breakpoints
│ └── GlobalStyles.js # Reset, RTL/LTR direction setup, and @media print rules
├── hooks/
│ ├── useAuth.js # Listens to Supabase auth session
│ └── useWeeklyLogs.js # TanStack Query hook fetching daily_logs + nested meal_logs
├── components/
│ ├── ui/ # Reusable styled primitives (Button, Card, Input, Badge)
│ ├── layout/ # Navbar, WeekNavigator, PrintHeader
│ └── tracker/ # DayRow / DayCard, MealSlot, FastingInput, LantusInput
└── pages/
├── LoginPage.jsx
├── WeeklyTrackerPage.jsx
├── AnalyticsPage.jsx
└── CheckupsPage.jsx
