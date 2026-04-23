import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../services/apiConfig";

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
  nomeUnidade: "Comanda",
  permitirObservacoes: true,
  fonte: "System",
};

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  const loadTheme = async (establishmentId = 1) => {
    try {
      const response = await fetch(
        `${API_URL}/estabelecimento/${establishmentId}/config`,
      );

      if (response.ok) {
        const config = await response.json();

        setTheme({
          fundoGeral: config.backgroundColor || defaultTheme.fundoGeral,
          fundoProdutos: config.cardsColor || defaultTheme.fundoProdutos,
          corTextoPrincipal: config.textsColor || defaultTheme.corTextoPrincipal,
          categoriaAtiva: config.activeCateogryColor || defaultTheme.categoriaAtiva,
          corCategorias: config.activeCateogryColor || defaultTheme.corCategorias,
          corBotoes: config.buttonsColor || defaultTheme.corBotoes,
          textoBotoes: config.buttonsTextColor || defaultTheme.textoBotoes,
          
          nomeUnidade: config.comandaLabel || defaultTheme.nomeUnidade,
          permitirObservacoes: config.allowObservations !== false,
          fonte: config.fontFamily || defaultTheme.fonte,
          
          textoSecundario: "#757575",
          borda: "#E0E0E0",
          headerGeral: config.cardsColor || defaultTheme.headerGeral,
        });
        console.log("[ThemeContext] Tema sincronizado via API.");
      }
    } catch (error) {
      console.warn("[ThemeContext] Erro na sincronização, usando padrão.", error.message);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
