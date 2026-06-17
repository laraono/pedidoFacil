import { ref, computed } from "vue";
import { request } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import localStorageService from "@/services/localStorageService";
import { useToast } from "@/composables/useToast";

interface EstablishmentConfig {
  backgroundColor?: string
  buttonsColor?: string
  buttonsTextColor?: string
  activeCategoryColor?: string
  textsColor?: string
  cardsColor?: string
  fontFamily?: string
  comandaLabel?: string
  allowObservations?: boolean
  logo?: string
}

export function useMenuTheme() {
  const { showToast } = useToast();

  const bgColor = ref("#F5F6FA");
  const buttonColor = ref("#1E7BC4");
  const buttonTextColor = ref("#FFFFFF");
  const categoryColor = ref("#7AB648");
  const textColor = ref("#212121");
  const cardBg = ref("#FFFFFF");
  const fontFamily = ref("Inter, sans-serif");
  const comandaUnitLabel = ref("Comanda");
  const observacoesPermitidas = ref(true);
  const imageUrl = ref("");
  const isSavingTheme = ref(false);

  const backgroundStyle = computed(() => ({ backgroundColor: bgColor.value }));

  const cardBgLuminance = computed(() => {
    const hex = cardBg.value.replace("#", "");
    if (hex.length < 6) return 1;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  });

  const isCardDark = computed(() => cardBgLuminance.value < 0.5);

  const theme = computed(() => ({
    bgColor: bgColor.value,
    buttonColor: buttonColor.value,
    buttonTextColor: buttonTextColor.value,
    categoryColor: categoryColor.value,
    textColor: textColor.value,
    cardBg: cardBg.value,
    fontFamily: fontFamily.value,
    adaptiveBorder: isCardDark.value ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.13)",
    adaptiveInputBg: isCardDark.value ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
    adaptiveButtonBg: isCardDark.value ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)",
    adaptiveSubtleBg: isCardDark.value ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)",
    adaptivePlaceholder: isCardDark.value ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.32)",
  }));

  async function loadConfig(estId: string | number) {
    try {
      const config: EstablishmentConfig = await request(`/estabelecimento/${estId}/config`, { method: "GET" });
      bgColor.value = config.backgroundColor || "#F5F6FA";
      buttonColor.value = config.buttonsColor || "#1E7BC4";
      buttonTextColor.value = config.buttonsTextColor || "#FFFFFF";
      categoryColor.value = config.activeCategoryColor || "#7AB648";
      textColor.value = config.textsColor || "#212121";
      cardBg.value = config.cardsColor || "#FFFFFF";
      fontFamily.value = config.fontFamily || "Inter, sans-serif";
      comandaUnitLabel.value = config.comandaLabel || "Comanda";
      observacoesPermitidas.value = config.allowObservations ?? true;
      if (config.logo) imageUrl.value = getImageUrl(config.logo);
    } catch {
      bgColor.value = localStorageService.getBackgroundColors() || "#F5F6FA";
      buttonColor.value = localStorageService.getButtonColors() || "#1E7BC4";
      buttonTextColor.value = localStorageService.getButtonTextColor() || "#FFFFFF";
      categoryColor.value = localStorageService.getCategoryColors() || "#7AB648";
      textColor.value = localStorageService.getTextColor() || "#212121";
      cardBg.value = localStorageService.getProductCardBg() || "#FFFFFF";
      fontFamily.value = localStorageService.getFontFamily() || "Inter, sans-serif";
      comandaUnitLabel.value = localStorageService.getComandaUnitLabel() || "Comanda";
      const savedImage = localStorageService.getImage();
      if (savedImage) imageUrl.value = getImageUrl(savedImage);
    }
  }

  async function saveVisuals() {
    isSavingTheme.value = true;
    try {
      await request("/estabelecimento/config", {
        method: "PUT",
        body: {
          backgroundColor: bgColor.value,
          cardsColor: cardBg.value,
          textsColor: textColor.value,
          buttonsColor: buttonColor.value,
          buttonsTextColor: buttonTextColor.value,
          activeCategoryColor: categoryColor.value,
          fontFamily: fontFamily.value,
          comandaLabel: comandaUnitLabel.value,
          allowObservations: observacoesPermitidas.value,
        },
      });

      localStorageService.saveBackgroundColors(bgColor.value);
      localStorageService.saveButtonColors(buttonColor.value);
      localStorageService.saveButtonTextColor(buttonTextColor.value);
      localStorageService.saveCategoryColors(categoryColor.value);
      localStorageService.saveFontFamily(fontFamily.value);
      localStorageService.saveTextColor(textColor.value);
      localStorageService.saveProductCardBg(cardBg.value);
      localStorageService.saveComandaUnitLabel(comandaUnitLabel.value);

      showToast("Aparência salva com sucesso!", "success");
    } catch (error: any) {
      const data = error.response?.data || error.data || error;
      if (data?.errors && Array.isArray(data.errors)) {
        showToast(data.errors[0].mensagem, "error");
      } else {
        showToast(data?.message || "Erro ao salvar configurações no servidor.", "error");
      }
    } finally {
      isSavingTheme.value = false;
    }
  }

  return {
    bgColor, buttonColor, buttonTextColor, categoryColor,
    textColor, cardBg, fontFamily, comandaUnitLabel, observacoesPermitidas,
    imageUrl, isSavingTheme,
    backgroundStyle, theme,
    loadConfig, saveVisuals,
  };
}
