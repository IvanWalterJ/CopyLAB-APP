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
        background: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        overlay: "var(--bg-overlay)",
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
        },
        accent: {
          amber: "var(--accent-amber)",
          emerald: "var(--accent-emerald)",
          red: "var(--accent-red)",
        },
        text: { 
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          subtle: "var(--border-subtle)",
          active: "var(--border-active)",
        }
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        'glow-indigo': 'var(--shadow-glow-indigo)',
        'glow-amber': 'var(--shadow-glow-amber)',
      }
    },
  },
  plugins: [],
};
export default config;
