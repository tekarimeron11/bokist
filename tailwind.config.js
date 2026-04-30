/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fdfaf6",
        ink: {
          DEFAULT: "#2d2a26",
          soft: "#6b6660",
        },
        blush: {
          DEFAULT: "#d4a5a5",
          soft: "#f3e1e1",
        },
        sage: {
          DEFAULT: "#6b8e7f",
          soft: "#d9e4dd",
        },
        gold: "#c9a961",
        line: "#ebe4d9",
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
        serif: ['"Noto Serif JP"', "serif"],
        display: ['"DM Serif Display"', "serif"],
      },
    },
  },
  plugins: [],
};
