import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#faf8f4",
        cream2: "#f5f1ea",
        cream3: "#ede8de",
        green: "#4a7c59",
        greenLight: "#6aab7e",
        greenDeep: "#2d5240",
        gold: "#c9923a",
        goldLight: "#e8b45a",
        text: "#1a1a1a",
        textMuted: "#6b6459",
        border: "#e2ddd5",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 6px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
