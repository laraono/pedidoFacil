import { useAuthStore } from '@/stores/auth';

const STORAGE_KEYS = {
  USERS: "users",
  SESSION: "session",
  ONBOARDING: "onboarding",
  IMAGE: "logo",
  BUTTONS: "buttons",
  BUTTON_TEXT_COLOR: "buttonTextColor",
  CATEGORY: "category",
  BACKGROUND: 'backgroundColors',
  FONT: 'fontFamily',
  TEXT_COLOR: 'textColor',
  CARD_BG: 'productCardBg',
  COMANDA_UNIT_LABEL: 'comandaUnitLabel',
};

// Chaves que devem ser isoladas por estabelecimento
const ESTABLISHMENT_KEYS = new Set([
  'onboarding', 'logo', 'buttons', 'buttonTextColor',
  'backgroundColors', 'category', 'fontFamily', 'textColor',
  'productCardBg', 'comandaUnitLabel',
]);

function getScopedKey(key) {
  if (!ESTABLISHMENT_KEYS.has(key)) return key;
  try {
    const auth = useAuthStore();
    const estId = auth.user?.estabelecimentoId;
    if (!estId) return null; // admin ou não autenticado: sem dados de estabelecimento
    return `est_${estId}_${key}`;
  } catch {
    return null;
  }
}

function getItem(key, defaultValue = null) {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return defaultValue;
  const data = localStorage.getItem(fullKey);
  return data ? JSON.parse(data) : defaultValue;
}

function setItem(key, value) {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return;
  localStorage.setItem(fullKey, JSON.stringify(value));
}

function getRaw(key, defaultValue) {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return defaultValue;
  return localStorage.getItem(fullKey) ?? defaultValue;
}

function setRaw(key, value) {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return;
  localStorage.setItem(fullKey, value);
}

export default {
  getUsers() { return getItem(STORAGE_KEYS.USERS, []); },
  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
  },
  findUser(email, password) {
    return this.getUsers().find(u => u.email === email && u.password === password);
  },
  setSession(user) { setItem(STORAGE_KEYS.SESSION, user); },
  getSession() { return getItem(STORAGE_KEYS.SESSION); },
  clearSession() { localStorage.removeItem(STORAGE_KEYS.SESSION); },

  saveOnboarding(data) { setItem(STORAGE_KEYS.ONBOARDING, data); },
  getOnboarding() { return getItem(STORAGE_KEYS.ONBOARDING, {}); },

  saveImage(base64String) { setItem(STORAGE_KEYS.IMAGE, base64String); },
  getImage() { return getItem(STORAGE_KEYS.IMAGE); },

  saveButtonColors(value) { setItem(STORAGE_KEYS.BUTTONS, value); },
  getButtonColors() { return getItem(STORAGE_KEYS.BUTTONS) || '#00FF85'; },

  saveButtonTextColor(value) { setItem(STORAGE_KEYS.BUTTON_TEXT_COLOR, value); },
  getButtonTextColor() { return getItem(STORAGE_KEYS.BUTTON_TEXT_COLOR) || '#000000'; },

  saveBackgroundColors(value) { setItem(STORAGE_KEYS.BACKGROUND, value); },
  getBackgroundColors() { return getItem(STORAGE_KEYS.BACKGROUND) || '#0B0E11'; },

  saveCategoryColors(value) { setItem(STORAGE_KEYS.CATEGORY, value); },
  getCategoryColors() { return getItem(STORAGE_KEYS.CATEGORY) || '#009DFF'; },

  getFontFamily() { return getRaw(STORAGE_KEYS.FONT, 'Inter, sans-serif'); },
  saveFontFamily(value) { setRaw(STORAGE_KEYS.FONT, value); },

  getTextColor() { return getRaw(STORAGE_KEYS.TEXT_COLOR, '#FFFFFF'); },
  saveTextColor(value) { setRaw(STORAGE_KEYS.TEXT_COLOR, value); },

  getProductCardBg() { return getRaw(STORAGE_KEYS.CARD_BG, '#1A1E24'); },
  saveProductCardBg(value) { setRaw(STORAGE_KEYS.CARD_BG, value); },

  getComandaUnitLabel() { return getRaw(STORAGE_KEYS.COMANDA_UNIT_LABEL, 'Comanda'); },
  saveComandaUnitLabel(value) { setRaw(STORAGE_KEYS.COMANDA_UNIT_LABEL, value); },
};
