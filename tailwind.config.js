/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enterprise: {
          dark: '#0f172a',
          blue: '#1d4ed8',
          gray: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
