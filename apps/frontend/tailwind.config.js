/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',
          'red-dark-1': '#B91C1C',
          'red-dark-2': '#991B1B',
          yellow: '#FBBF24',
          'yellow-orange': '#F59E0B',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#DC2626",   // Rouge Cinéma
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#18181b", // Zinc 900
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#18181b",
          foreground: "#9ca3af", // Gray 400
        },
        accent: {
          DEFAULT: "#27272a", // Zinc 800
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#09090b", // Zinc 950
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#18181b", // Zinc 900
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}