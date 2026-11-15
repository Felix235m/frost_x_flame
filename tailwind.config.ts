/**
 * NOT LOADED AT BUILD TIME.
 *
 * This project runs Tailwind v4, which reads its theme from CSS and only picks up a
 * JS config through an explicit `@config` directive. There is none, so the values
 * below never reach the compiled stylesheet.
 *
 * Design tokens are defined in `src/app/globals.css` under `@theme`. Add new tokens
 * there, not here, or the utility silently will not exist.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mjs}",
    "./src/components/**/*.{js,ts,jsx,tsx,mjs}",
    "./src/app/**/*.{js,ts,jsx,tsx,mjs}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian root theme
        "obsidian-root": "#0A0C10",
        "obsidian-elevated": "#12161F",
        "obsidian-card": "#1A202C",
        "surface-container": "#1E2024",
        "surface-container-low": "#1A1C20",
        "surface-container-lowest": "#0C0E12",
        "surface-container-high": "#282A2E",
        "surface-container-highest": "#333539",
        "on-surface": "#E2E2E8",
        "on-surface-variant": "#BAC9CC",
        outline: "#849396",
        "outline-variant": "#3B494C",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-glow-frost": "rgba(0, 229, 255, 0.35)",
        "border-glow-flame": "rgba(255, 85, 0, 0.35)",
        // Brand spectrum
        "frost-cyan": "#00E5FF",
        "frost-sky": "#38BDF8",
        "flame-neon": "#FF5500",
        "flame-amber": "#F97316",
        // Status semantics
        "status-available": "#10B981",
        "status-held": "#F59E0B",
        "status-booked": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-space-grotesk)"],
        mono: ["var(--font-geist-mono)"],
      },
      fontSize: {
        "label-timer": ["20px", { lineHeight: "24px", letterSpacing: "0.05em", fontVariationSettings: "'tnum' on" }],
        "label-badge": ["11px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        "label-action": ["14px", { lineHeight: "18px", letterSpacing: "0.04em" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "38px", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "34px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "display-hero-mobile": ["40px", { lineHeight: "48px", fontWeight: "700", letterSpacing: "-0.02em" }],
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2.5rem",
        gutter: "1rem",
        margin: "1rem",
        "gutter-desktop": "1.5rem",
        "margin-desktop": "2.5rem",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        "neon-available": "0 0 20px rgba(16, 185, 129, 0.25), inset 0 0 12px rgba(16, 185, 129, 0.1)",
        "neon-frost": "0 0 24px rgba(0, 229, 255, 0.35)",
        "neon-flame": "0 0 20px rgba(255, 85, 0, 0.25)",
        cart: "0 12px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(0, 229, 255, 0.2)",
      },
      animation: {
        ping: "animate-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        spin: "spin 4s linear infinite",
      },
    },
  },
  plugins: [],
};
