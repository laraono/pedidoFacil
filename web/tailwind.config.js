/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    // Esta linha é essencial para escanear todos os seus componentes Vue
    "./src/**/*.{vue,js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}