// Colors (glucose status colors!), spacing, fonts, breakpoints
export const theme = {
  colors: {
    // Base surfaces
    bgApp: "#f4f6f9",
    bgSurface: "#ffffff",
    bgSubtle: "#f8fafc",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",

    // Typography
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",

    // Brand / Interactive
    primary: "#0284c7",
    primaryHover: "#0369a1",
    primaryLight: "#e0f2fe",

    // Insulin accents
    novorapid: "#7c3aed", // Rapid-acting mealtime insulin
    novorapidLight: "#ede9fe",
    lantus: "#0d9488", // Basal bedtime insulin
    lantusLight: "#ccfbf1",

    // Semantic Blood Glucose Statuses (mg/dL)
    glucose: {
      low: {
        text: "#b91c1c",
        bg: "#fee2e2",
        border: "#fca5a5",
      },
      target: {
        text: "#15803d",
        bg: "#dcfce7",
        border: "#86efac",
      },
      elevated: {
        text: "#b45309",
        bg: "#fef3c7",
        border: "#fcd34d",
      },
      high: {
        text: "#991b1b",
        bg: "#fecaca",
        border: "#f87171",
      },
      empty: {
        text: "#64748b",
        bg: "#f1f5f9",
        border: "#e2e8f0",
      },
    },
  },

  fonts: {
    body: "'Vazirmatn', 'Tahoma', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
    md: "0 4px 12px rgba(15, 23, 42, 0.08)",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};

/**
 * Helper to resolve semantic colors for a given glucose reading (mg/dL).
 * type: 'fasting' | 'post_meal'
 */
export function getGlucoseTheme(value, type = "fasting") {
  if (value === null || value === undefined || value === "") {
    return theme.colors.glucose.empty;
  }

  const num = Number(value);

  // Hypoglycemia threshold (< 70 mg/dL)
  if (num < 70) {
    return theme.colors.glucose.low;
  }

  if (type === "fasting") {
    if (num <= 130) return theme.colors.glucose.target;
    if (num <= 180) return theme.colors.glucose.elevated;
    return theme.colors.glucose.high;
  }

  // Post-meal (2 hours after eating)
  if (num < 180) return theme.colors.glucose.target;
  if (num <= 220) return theme.colors.glucose.elevated;
  return theme.colors.glucose.high;
}
