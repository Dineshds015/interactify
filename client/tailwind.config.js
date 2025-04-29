import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}" // This makes sure Tailwind looks for classes in all JSX, TSX, JS, and TS files in your `src` folder
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
}
