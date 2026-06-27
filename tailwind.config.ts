import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces & Backgrounds ──────────────────────────────────────
        background: "#F4F0E7",
        "background-soft": "#EEE8DC",
        surface: "#FAF8F2",
        "surface-raised": "#FFFCF6",

        // Card aliases (legacy compat)
        card: "#FAF8F2",
        "card-hover": "#F0EBE0",

        // ── Primary: Deep Botanical Green ───────────────────────────────
        primary: "#153328",
        "primary-dark": "#0D261D",
        "primary-muted": "#355448",

        // ── Accent: Antique Brass ───────────────────────────────────────
        accent: "#A98749",
        "accent-muted": "#C2A873",
        "accent-soft": "#DED1B4",

        // ── Text ────────────────────────────────────────────────────────
        heading: "#173229",
        muted: "#526159",
        "muted-light": "#7C837E",

        // ── Borders ─────────────────────────────────────────────────────
        border: "#D8D0C1",
        "border-strong": "#B8AD98",

        // ── Semantic UI ─────────────────────────────────────────────────
        rarity: "#8B493F",
        price: "#A98749",
        leaf: "#496B55",

        // ── Legacy overlay tokens (map to warm tones for image overlays) ─
        "forest-dark": "#F4F0E7",
        "forest-deep": "#EEE8DC",
        olive: "#355448",
        "olive-light": "#526159",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse at center 40%, rgba(169, 135, 73, 0.07) 0%, transparent 65%)",
        "card-glow":
          "linear-gradient(135deg, rgba(21, 51, 40, 0.02) 0%, transparent 50%)",
      },
      boxShadow: {
        glass: "0 1px 4px rgba(21, 51, 40, 0.07), 0 0 0 1px rgba(216, 208, 193, 1)",
        "glass-hover":
          "0 2px 10px rgba(21, 51, 40, 0.10), 0 0 0 1px rgba(184, 173, 152, 1)",
        glow: "0 0 0 2px rgba(169, 135, 73, 0.30)",
        "card-sm": "0 1px 3px rgba(21, 51, 40, 0.05)",
      },
      borderRadius: {
        "2xl": "10px",
        "3xl": "14px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
