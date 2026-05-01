/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#fdfaf6",
          deep:    "#f7f1e6",
          warm:    "#f3ebd9",
        },
        ink: {
          DEFAULT: "#2d2a26",
          soft:    "#5a544c",
          faint:   "#8b8275",
        },
        blush: {
          DEFAULT: "#c98a8a",
          soft:    "#f3e1e1",
          deep:    "#8a4a4a",
        },
        sage: {
          DEFAULT: "#5a7d6f",
          soft:    "#d9e4dd",
          deep:    "#3a5a4d",
        },
        iris: {
          DEFAULT: "#7a6593",
          soft:    "#e8e0f0",
          deep:    "#4a3a5e",
        },
        gold: {
          DEFAULT: "#b08a3e",
          soft:    "#fcf2dc",
          deep:    "#7a5e1f",
        },
        cocoa: {
          DEFAULT: "#7a5a45",
          soft:    "#f0e7e2",
          deep:    "#4a3525",
        },
        line: {
          DEFAULT: "#ebe4d9",
          strong:  "#c9bfae",
        },
        seal: "#a83838",
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
        serif: ['"Noto Serif JP"', "serif"],
        display: ['"Marcellus"', '"Noto Serif JP"', "serif"],
        ledger: ['"DM Mono"', '"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow: ["10px", { lineHeight: "1.2", letterSpacing: "0.22em" }],
        micro:   ["11px", { lineHeight: "1.5" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        card:  "0.75rem",
        field: "0.5rem",
        sheet: "1.5rem",
      },
      boxShadow: {
        paper: "0 1px 0 rgba(45,42,38,0.04), 0 8px 24px -12px rgba(45,42,38,0.10)",
        press: "0 1px 0 rgba(45,42,38,0.06)",
        seal:  "0 0 0 1px rgba(168,56,56,0.2), 0 2px 8px -2px rgba(168,56,56,0.3)",
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        stamp: {
          "0%":   { opacity: "0", transform: "scale(1.4) rotate(-8deg)" },
          "60%":  { opacity: "1", transform: "scale(0.95) rotate(-4deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-3deg)" },
        },
        underline: {
          "0%":   { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.6" },
        },
      },
      animation: {
        reveal:       "reveal 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        stamp:        "stamp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        underline:    "underline 0.4s ease-out 0.2s both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
