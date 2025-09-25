// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          emerald: "#1B998B",
          white: "#FFFFFF",
          lightgray: "#F5F5F5",
        }
      }
    }
  }
};

export default config;
