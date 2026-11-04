import type { Config } from "tailwindcss";
import preset from "@subboost/config/tailwind-preset";

export default {
  presets: [preset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config;
