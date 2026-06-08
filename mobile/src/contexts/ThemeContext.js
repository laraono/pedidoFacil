import React, { createContext, useContext, useState, useEffect } from "react";
import { appConfig } from "../services/apiConfig";
import { getFullImageUrl } from "../utils/imageUtils";

function isLightColor(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

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
  bordaCard: "#E0E0E0",
  headerGeral: "#FFFFFF",
  nomeUnidade: "Comanda",
  permitirObservacoes: true,
  fonte: "System",
  logoUrl: null,
  nomeEstabelecimento: null,
};

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  const loadTheme = async () => {
    try {
      const response = await fetch(
        `${appConfig.API_URL}/estabelecimento/${appConfig.ESTABLISHMENT_ID}/public`
      );

      if (response.ok) {
        const data = await response.json();
        const config = data.configurations || {};
        
        const logoPath = config.logo;
        const logoSource = getFullImageUrl(logoPath);
        const logoUrl = logoSource ? logoSource.uri : null;

        const bgColor = config.backgroundColor || defaultTheme.fundoGeral;
        const cardColor = config.cardsColor || defaultTheme.fundoProdutos;
        const bgIsLight = isLightColor(bgColor);
        const cardIsLight = isLightColor(cardColor);

        setTheme({
          fundoGeral: bgColor,
          fundoProdutos: cardColor,
          corTextoPrincipal: config.textsColor || defaultTheme.corTextoPrincipal,
          categoriaAtiva: config.activeCateogryColor || defaultTheme.categoriaAtiva,
          corCategorias: config.activeCateogryColor || defaultTheme.corCategorias,
          corBotoes: config.buttonsColor || defaultTheme.corBotoes,
          textoBotoes: config.buttonsTextColor || defaultTheme.textoBotoes,

          nomeUnidade: config.comandaLabel || defaultTheme.nomeUnidade,
          permitirObservacoes: config.allowObservations !== false,
          fonte: config.fontFamily || defaultTheme.fonte,

          textoSecundario: bgIsLight ? "#757575" : "rgba(255,255,255,0.5)",
          borda: bgIsLight ? "#E0E0E0" : "rgba(255,255,255,0.12)",
          bordaCard: cardIsLight ? "#E0E0E0" : "rgba(255,255,255,0.12)",
          headerGeral: cardColor,
          logoUrl,
          nomeEstabelecimento: data.name || null,
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