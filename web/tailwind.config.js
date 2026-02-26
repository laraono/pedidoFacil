/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#00D26A',        
        'brand-green-hover': '#00b058',  

        'dark-bg': '#050505',            
        'dark-card': '#121212',          

        'header-default': '#2c2c2c',     
        'header-kitchen': '#1a1a1a',     
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}