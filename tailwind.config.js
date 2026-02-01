/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // COLORES CORPORATIVOS IMPRIARTEX
        primary: {
          DEFAULT: "#0056b3", // Azul principal
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#facc15", // Amarillo para alertas o detalles
          foreground: "#000000",
        },
        accent: "#003d7a", // Azul oscuro para contrastes
        background: "#f8fafc", // Fondo blanco/grisáceo limpio
        card: {
          DEFAULT: "#ffffff", // Tarjetas blancas
          foreground: "#1e293b",
        },
        border: "#e2e8f0",
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}
