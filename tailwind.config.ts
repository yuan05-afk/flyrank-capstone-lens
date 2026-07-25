import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F3F7",
        surface: "#FFFFFF",
        ink: "#101828",
        muted: "#667085",
        line: "#E4E7EC",
        lens: "#D97706",
        "lens-bright": "#F59E0B",
        "lens-fog": "#FEF3C7",
        ok: "#15803D",
        warn: "#B45309",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Figtree", "sans-serif"],
        display: ["Outfit", "Figtree", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
