import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Single-theme tokens mapped to CSS variables */
        bg: "var(--color-bg)",
        text: "var(--color-text)",
        brand: "var(--color-brand)",
        border: "var(--color-border)",
      },
    },
  },
  plugins: [],
};

export default config;
