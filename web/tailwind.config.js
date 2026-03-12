/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          500: '#1A55E3',
          600: '#1548C2',
          300: '#5E6EED',
          400: '#4F5FD1',
        },
        pink: {
          500: '#FF0854',
          600: '#E0074A',
        },
        green: {
          500: '#00D284',
          600: '#00B873',
        },
        blue: {
          500: '#0DCAF0',
          600: '#0BB5D6',
        },
        brand: {
          green: '#00FF85',
          'green-hover': '#00E676',
        },
        dark: {
          bg: '#0B0E11',
          card: '#1A1E24',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}