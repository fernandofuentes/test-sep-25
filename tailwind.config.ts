// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}", // 👈 important: scans all your files
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

export default config;
