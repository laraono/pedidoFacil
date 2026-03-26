import React, { createContext, useContext, useState } from "react";

const defaultTheme = {
  fundoGeral: "#F5F6FA",
  fundoProdutos: "#FFFFFF",
  corTextoPrincipal: "#212121",
  categoriaAtiva: "#7AB648",
  corCategorias: "#7AB648",
  corBotoes: "#1E7BC4",
  textoBotoes: "#FFFFFF",
  textoSecundario: "#757575",
  borda: "#E0E0E0",
  headerGeral: "#FFFFFF",
};

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
