/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3b82f6", // Azul Impriartex
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.5)",
          foreground: "#f1f5f9",
        },
        accent: "#60a5fa",
        success: "#22c55e",
        warning: "#f59e0b",
        destructive: "#ef4444",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
