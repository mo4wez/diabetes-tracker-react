const baseTheme = {
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
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};

export const lightTheme = {
  ...baseTheme,
  mode: "light",
  shadows: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
    md: "0 4px 12px rgba(15, 23, 42, 0.08)",
  },
  colors: {
    bgApp: "#f4f6f9",
    bgSurface: "#ffffff",
    bgSubtle: "#f8fafc",
    bgInput: "#ffffff",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",

    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",

    primary: "#0284c7",
    primaryHover: "#0369a1",
    primaryLight: "#e0f2fe",

    novorapid: "#7c3aed",
    novorapidLight: "#ede9fe",
    lantus: "#0d9488",
    lantusLight: "#ccfbf1",

    glucose: {
      low: { text: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
      target: { text: "#15803d", bg: "#dcfce7", border: "#86efac" },
      elevated: { text: "#b45309", bg: "#fef3c7", border: "#fcd34d" },
      high: { text: "#991b1b", bg: "#fecaca", border: "#f87171" },
      empty: { text: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
    },
  },
};

export const darkTheme = {
  ...baseTheme,
  mode: "dark",
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.4)",
    md: "0 6px 16px rgba(0, 0, 0, 0.5)",
  },
  colors: {
    bgApp: "#0b1120", // Deep slate night background
    bgSurface: "#131c31", // Elevated card surface
    bgSubtle: "#1a253c", // Meal row & secondary input background
    bgInput: "#0f172a",
    border: "#24324d",
    borderStrong: "#334669",

    textPrimary: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",

    primary: "#38bdf8",
    primaryHover: "#0ea5e9",
    primaryLight: "rgba(56, 189, 248, 0.15)",

    novorapid: "#c084fc",
    novorapidLight: "rgba(192, 132, 252, 0.16)",
    lantus: "#2dd4bf",
    lantusLight: "rgba(45, 212, 191, 0.15)",

    glucose: {
      low: {
        text: "#fca5a5",
        bg: "rgba(239, 68, 68, 0.18)",
        border: "rgba(248, 113, 113, 0.45)",
      },
      target: {
        text: "#86efac",
        bg: "rgba(34, 197, 94, 0.16)",
        border: "rgba(74, 222, 128, 0.4)",
      },
      elevated: {
        text: "#fcd34d",
        bg: "rgba(245, 158, 11, 0.16)",
        border: "rgba(251, 191, 36, 0.4)",
      },
      high: {
        text: "#fda4af",
        bg: "rgba(225, 29, 72, 0.2)",
        border: "rgba(251, 113, 133, 0.45)",
      },
      empty: {
        text: "#94a3b8",
        bg: "rgba(148, 163, 184, 0.1)",
        border: "#2b3a55",
      },
    },
  },
};

/**
 * Resolves semantic colors for a glucose reading (mg/dL) in either light or dark mode.
 */
export function getGlucoseTheme(value, type = "fasting", mode = "light") {
  const palette =
    mode === "dark" ? darkTheme.colors.glucose : lightTheme.colors.glucose;

  if (value === null || value === undefined || value === "") {
    return palette.empty;
  }

  const num = Number(value);
  if (num < 70) return palette.low;

  if (type === "fasting") {
    if (num <= 130) return palette.target;
    if (num <= 180) return palette.elevated;
    return palette.high;
  }

  if (num < 180) return palette.target;
  if (num <= 220) return palette.elevated;
  return palette.high;
}
