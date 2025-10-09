import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { 
    extend: {
      container: { center: true, padding: "1rem" }
    }
  },
  darkMode: "class",
  plugins: [heroui(), require("tailwindcss-animate")],
};
export default config;


