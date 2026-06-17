import React, { createContext, useContext, useState, useEffect } from "react";
import { appConfig } from "../services/apiConfig";
import { getFullImageUrl } from "../utils/imageUtils";

export interface Theme {
  fundoGeral: string
  fundoProdutos: string
  corTextoPrincipal: string
  categoriaAtiva: string
  corCategorias: string
  corBotoes: string
  textoBotoes: string
  textoSecundario: string
  borda: string
  bordaCard: string
  headerGeral: string
  nomeUnidade: string
  permitirObservacoes: boolean
  fonte: string
  logoUrl: string | null
  nomeEstabelecimento: string | null
}

interface ThemeContextType {
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  loadTheme: () => Promise<void>
}

function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

const defaultTheme: Theme = {
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

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const loadTheme = async () => {
    if (!appConfig.ESTABLISHMENT_ID || !appConfig.API_URL) return;
    try {
      const response = await fetch(
        `${appConfig.API_URL}/estabelecimento/${appConfig.ESTABLISHMENT_ID}/public`
      );

      if (response.ok) {
        const data = await response.json();
        const config = data.configurations || {};

        const logoPath: string | null = config.logo ?? null;
        const logoUrl = logoPath
          ? (logoPath.startsWith('http') ? logoPath : `${appConfig.BASE_IP}/uploads/${logoPath}`)
          : null;

        const bgColor = config.backgroundColor || defaultTheme.fundoGeral;
        const cardColor = config.cardsColor || defaultTheme.fundoProdutos;
        const bgIsLight = isLightColor(bgColor);
        const cardIsLight = isLightColor(cardColor);

        setTheme({
          fundoGeral: bgColor,
          fundoProdutos: cardColor,
          corTextoPrincipal: config.textsColor || defaultTheme.corTextoPrincipal,
          categoriaAtiva: config.activeCategoryColor || defaultTheme.categoriaAtiva,
          corCategorias: config.activeCategoryColor || defaultTheme.corCategorias,
          corBotoes: config.buttonsColor || defaultTheme.corBotoes,
          textoBotoes: config.buttonsTextColor || defaultTheme.textoBotoes,
          nomeUnidade: config.comandaLabel || defaultTheme.nomeUnidade,
          permitirObservacoes: config.allowObservations === true,
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
    } catch (error: any) {
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
