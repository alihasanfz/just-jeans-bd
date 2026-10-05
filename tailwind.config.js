/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        denim: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#38a5f6",
          500: "#0e87eb",
          600: "#026ac9",
          700: "#0354a2",
          800: "#074885",
          900: "#0b3d6f",
          950: "#072649",
          deep: "#0b2545",
          midnight: "#07172c",
        },
        indigo: {
          950: "#0c1024",
          luxury: "#0b2545",
        },
        copper: {
          DEFAULT: "#d97706",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          stitch: "#d97706",
        },
        slateGlass: {
          light: "rgba(255, 255, 255, 0.8)",
          dark: "rgba(11, 15, 25, 0.85)",
          border: "rgba(255, 255, 255, 0.12)",
          card: "rgba(11, 37, 69, 0.04)",
        },
        brand: {
          dark: "#090d16",
          darkNavy: "#07172c",
          darkDenim: "#0d1b2a",
          card: "#121826",
          accent: "#2563eb",
          accentCyan: "#06b6d4",
          accentHover: "#1d4ed8",
          copper: "#d97706",
          gold: "#eab308",
          silver: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'glow-soft': '0 0 25px rgba(37, 99, 235, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        'glow-copper': '0 0 20px rgba(217, 119, 6, 0.3)',
        'luxe-card': '0 12px 36px -8px rgba(11, 37, 69, 0.12), 0 4px 14px -2px rgba(11, 37, 69, 0.05)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-subtle": "pulse-subtle 2s infinite ease-in-out",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
