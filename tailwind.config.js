/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper layer kept for legacy refs but tones lean warm peach now
        paper: {
          DEFAULT: "#fff5ec",
          deep:    "#ffe9e0",
          warm:    "#ffd6c8",
        },
        ink: {
          DEFAULT: "#2a1f2a",
          soft:    "#6a4f4a",
          faint:   "#8a6f6a",
        },
        rose:  "#b8746e",        // eyebrow / muted accent
        coral: {
          DEFAULT: "#c66454",    // primary accent
          deep:    "#a04d3f",
        },
        peach: {
          start: "#ff9c8a",      // gradient start
          end:   "#ffb480",      // gradient end
          mid:   "#ffc28a",
        },
        // 5 categories tuned warm pastel
        sage:    { DEFAULT: "#8fb178", soft: "#dfead0", deep: "#5d7a4a" }, // asset
        blush:   { DEFAULT: "#e0a098", soft: "#ffd2c8", deep: "#a04d3f" }, // liability
        lavender:{ DEFAULT: "#b09cc9", soft: "#e2d3ee", deep: "#6b4f8a" }, // equity
        gold:    { DEFAULT: "#d4a14b", soft: "#ffe2b8", deep: "#9a6c1c" }, // revenue
        mocha:   { DEFAULT: "#b08a6a", soft: "#ead7c5", deep: "#7a4f2c" }, // expense
        line:    { DEFAULT: "rgba(255,255,255,0.7)", strong: "rgba(180,90,80,0.18)" },
      },
      fontFamily: {
        sans:    ['"Outfit"', '"Noto Sans JP"', "system-ui", "sans-serif"],
        serif:   ['"Fraunces"', '"Noto Serif JP"', "serif"],
        display: ['"Fraunces"', '"Noto Serif JP"', "serif"],
      },
      fontSize: {
        eyebrow: ["10px", { lineHeight: "1.2", letterSpacing: "0.28em" }],
        micro:   ["11px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        sheet: "1.5rem",
      },
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 40px -12px rgba(180,90,80,0.18)",
        "glass-sm": "0 12px 32px -10px rgba(180,90,80,0.16)",
        coral: "0 6px 14px -4px rgba(255,120,90,0.4)",
        "coral-soft": "0 8px 24px -8px rgba(255,120,90,0.35)",
      },
      backgroundImage: {
        "peach-gradient": "linear-gradient(135deg, #ff9c8a, #ffb480)",
        "peach-soft":     "linear-gradient(135deg, #ffd2c0, #ffe1b2)",
        "card-gradient":  "linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4))",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rise": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stamp": {
          "0%":   { opacity: "0", transform: "scale(1.3) rotate(-6deg)" },
          "60%":  { opacity: "1", transform: "scale(0.95) rotate(-2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-1deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "rise":    "rise 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "stamp":   "stamp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};
