/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary — Emerald (knowledge, trust, books)
        brand: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Accent — Terracotta (warm, editorial, restrained)
        accent: {
          50:  "#fef7ee",
          100: "#fdedd6",
          200: "#fad7ac",
          300: "#f6ba78",
          400: "#f19346",
          500: "#ed7624",
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
          900: "#431407",
        },
        // Ink — Slate (professional, neutral, editorial)
        ink: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Surfaces — warm ivory family (paper-like)
        ivory:    "#fafaf7",
        sand:     "#f5efe6",
        clay:     "#fbeae0",
        sage:     "#ecfdf5",
        mint:     "#d1fae5",
        // Emphasis — gold for highlights/CTAs
        gold:     "#b45309",
        goldSoft: "#fef3c7",
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 4px 16px -4px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};