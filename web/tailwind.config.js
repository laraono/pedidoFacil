/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    // Esta linha é essencial para escanear todos os seus componentes Vue
    "./src/**/*.{vue,js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // --- CORES PRINCIPAIS DA MARCA ---
        'brand-green': '#00D26A',        // Aquele verde neon lindo dos botões e ícones
        'brand-green-hover': '#00b058',  // O verde um pouco mais escuro para o hover

        // --- FUNDOS ESCUROS (Login / Cadastro) ---
        'dark-bg': '#050505',            // O fundo que a Lara sugeriu padronizar
        'dark-card': '#121212',          // O fundo do card central de login/cadastro

        // --- HEADERS (AppHeader) ---
        'header-default': '#2c2c2c',     // O cinza escuro dos funcionários comuns
        'header-kitchen': '#1a1a1a',     // O fundo quase preto da fila de pedidos
      },
      fontFamily: {
        // Eu notei que você usa bastante a classe "font-inter" nas suas telas!
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}