// ============================================================
// CloudPath Quiz — Tailwind Configuration (Signal Gravity Theme)
// ============================================================
// NOTE: Tailwind v4 uses CSS-based configuration via @theme in globals.css.
// This config file serves as a reference for the design system tokens.
// The actual theme values are defined in app/globals.css using @theme inline.
//
// Path accent colours:
//   SA  (Solutions Architect)  → #3B82F6 (blue)
//   CE  (Cloud/DevOps Eng)     → #10B981 (emerald)
//   SEC (Security Specialist)  → #EF4444 (red)
//   DML (Data/ML Engineer)     → #8B5CF6 (violet)
//   SRE (Platform/SRE)         → #F59E0B (amber)
//   CON (Cloud Consultant)     → #06B6D4 (cyan)
// ============================================================

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0A",
          card: "#111111",
          hover: "#1A1A1A",
          border: "#1F1F1F",
        },
        text: {
          primary: "#FFFFFF",
          body: "#A1A1AA",
          muted: "#71717A",
        },
        accent: {
          sa: "#3B82F6",
          ce: "#10B981",
          sec: "#EF4444",
          dml: "#8B5CF6",
          sre: "#F59E0B",
          con: "#06B6D4",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
