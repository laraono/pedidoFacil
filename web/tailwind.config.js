/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exemplo: adicione cores personalizadas para o seu app
        brand: {
          light: '#6ee7b7',
          DEFAULT: '#10b981',
          dark: '#047857',
        }
      }
    },
  },
  plugins: [],
}
