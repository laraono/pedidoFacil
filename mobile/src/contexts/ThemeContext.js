import React, { createContext, useContext, useState } from 'react';

// MOCK GLOBAL: O DNA do seu Tailwind CSS da Web
const defaultTheme = {
  fundoGeral: '#0B0E11',         // dark.bg
  fundoProdutos: '#1A1E24',      // dark.card
  corTextoPrincipal: '#FFFFFF',  // Texto claro padrão para leitura
  categoriaAtiva: '#0DCAF0',     // blue.500 (Baseado na "Categoria Ativa" do seu Editor Visual)
  corBotoes: '#00FF85',          // brand.green (O verde neon principal)
  textoBotoes: '#0B0E11',        // Fundo escuro (dark.bg) para dar um contraste brutal no botão neon
  
  // Cores de apoio geradas para dar harmonia
  textoSecundario: '#8B949E',    // Cinza claro para descrições dos lanches
  borda: '#1A1E24',              // Cor de borda discreta
  headerGeral: '#1A1E24',        // Fundo do Topo (Substituindo aquele Azulão antigo)
};

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  // Estado que gerencia o tema. 
  // Futuramente, a API vai mandar um JSON parecido com o defaultTheme e você fará: setTheme(dadosDaApi)
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook maroto para puxar o tema em qualquer tela
export const useTheme = () => useContext(ThemeContext);