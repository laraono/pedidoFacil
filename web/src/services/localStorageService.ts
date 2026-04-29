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
} as const;

const ESTABLISHMENT_KEYS = new Set([
  'onboarding', 'logo', 'buttons', 'buttonTextColor',
  'backgroundColors', 'category', 'fontFamily', 'textColor',
  'productCardBg', 'comandaUnitLabel',
]);

function getScopedKey(key: string): string | null {
  if (!ESTABLISHMENT_KEYS.has(key)) return key;
  try {
    const auth = useAuthStore();
    const estId = auth.user?.estabelecimentoId;
    if (!estId) return null; 
    return `est_${estId}_${key}`;
  } catch {
    return null;
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return defaultValue;
  const data = localStorage.getItem(fullKey);
  return data ? JSON.parse(data) as T : defaultValue;
}

function setItem<T>(key: string, value: T): void {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return;
  localStorage.setItem(fullKey, JSON.stringify(value));
}

function getRaw(key: string, defaultValue: string): string {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return defaultValue;
  return localStorage.getItem(fullKey) ?? defaultValue;
}

function setRaw(key: string, value: string): void {
  const fullKey = getScopedKey(key);
  if (fullKey === null) return;
  localStorage.setItem(fullKey, value);
}

export interface StoredUser {
  email: string;
  password: string;
  [key: string]: unknown;
}

export default {
  getUsers(): StoredUser[] { return getItem<StoredUser[]>(STORAGE_KEYS.USERS, []); },
  saveUser(user: StoredUser): void {
    const users = this.getUsers();
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
  },
  findUser(email: string, password: string): StoredUser | undefined {
    return this.getUsers().find(u => u.email === email && u.password === password);
  },
  setSession(user: unknown): void { setItem(STORAGE_KEYS.SESSION, user); },
  getSession(): unknown { return getItem(STORAGE_KEYS.SESSION, null); },
  clearSession(): void { localStorage.removeItem(STORAGE_KEYS.SESSION); },

  saveOnboarding(data: unknown): void { setItem(STORAGE_KEYS.ONBOARDING, data); },
  getOnboarding(): unknown { return getItem(STORAGE_KEYS.ONBOARDING, {}); },

  saveImage(base64String: string): void { setItem(STORAGE_KEYS.IMAGE, base64String); },
  getImage(): string | null { return getItem<string | null>(STORAGE_KEYS.IMAGE, null); },

  saveButtonColors(value: string): void { setItem(STORAGE_KEYS.BUTTONS, value); },
  getButtonColors(): string { return getItem<string | null>(STORAGE_KEYS.BUTTONS, null) || '#00FF85'; },

  saveButtonTextColor(value: string): void { setItem(STORAGE_KEYS.BUTTON_TEXT_COLOR, value); },
  getButtonTextColor(): string { return getItem<string | null>(STORAGE_KEYS.BUTTON_TEXT_COLOR, null) || '#000000'; },

  saveBackgroundColors(value: string): void { setItem(STORAGE_KEYS.BACKGROUND, value); },
  getBackgroundColors(): string { return getItem<string | null>(STORAGE_KEYS.BACKGROUND, null) || '#0B0E11'; },

  saveCategoryColors(value: string): void { setItem(STORAGE_KEYS.CATEGORY, value); },
  getCategoryColors(): string { return getItem<string | null>(STORAGE_KEYS.CATEGORY, null) || '#009DFF'; },

  getFontFamily(): string { return getRaw(STORAGE_KEYS.FONT, 'Inter, sans-serif'); },
  saveFontFamily(value: string): void { setRaw(STORAGE_KEYS.FONT, value); },

  getTextColor(): string { return getRaw(STORAGE_KEYS.TEXT_COLOR, '#FFFFFF'); },
  saveTextColor(value: string): void { setRaw(STORAGE_KEYS.TEXT_COLOR, value); },

  getProductCardBg(): string { return getRaw(STORAGE_KEYS.CARD_BG, '#1A1E24'); },
  saveProductCardBg(value: string): void { setRaw(STORAGE_KEYS.CARD_BG, value); },

  getComandaUnitLabel(): string { return getRaw(STORAGE_KEYS.COMANDA_UNIT_LABEL, 'Comanda'); },
  saveComandaUnitLabel(value: string): void { setRaw(STORAGE_KEYS.COMANDA_UNIT_LABEL, value); },
};
