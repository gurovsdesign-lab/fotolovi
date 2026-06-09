import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F6F2",
        ink: "#1E1E1E",
        muted: "#6F6B64",
        action: "#4A6CF7",
        gold: "#D6B36A",
        night: "#121212",
        "ml-accent": "var(--ml-accent)",
        "ml-bg": "var(--ml-bg)",
        "ml-focus": "var(--ml-focus)",
        "ml-ink": "var(--ml-ink)",
        "ml-line": "var(--ml-line)",
        "ml-muted": "var(--ml-muted)",
        "ml-soft": "var(--ml-soft)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(30, 30, 30, 0.08)",
        glow: "0 0 80px rgba(214, 179, 106, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
