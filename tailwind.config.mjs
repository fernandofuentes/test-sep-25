// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          emerald: "#1B998B",
          white: "#FFFFFF",
          lightgray: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};
