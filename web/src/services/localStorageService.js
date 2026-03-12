const STORAGE_KEYS = {
  USERS: "users",
  SESSION: "session",
  ONBOARDING: "onboarding",
  IMAGE: "logo",
  BUTTONS: "buttons",
  BUTTON_TEXT_COLOR: "buttonTextColor", // NOVO
  CATEGORY: "category",
  BACKGROUND: 'backgroundColors',
  FONT: 'fontFamily',
  TEXT_COLOR: 'textColor',
  CARD_BG: 'productCardBg',
};

function getItem(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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

  saveImage(base64String) { setItem(STORAGE_KEYS.IMAGE, base64String) },
  getImage() { return getItem(STORAGE_KEYS.IMAGE) },

  saveButtonColors(value) { setItem(STORAGE_KEYS.BUTTONS, value) },
  getButtonColors() { return getItem(STORAGE_KEYS.BUTTONS) || '#00FF85' },

  saveButtonTextColor(value) { setItem(STORAGE_KEYS.BUTTON_TEXT_COLOR, value) },
  getButtonTextColor() { return getItem(STORAGE_KEYS.BUTTON_TEXT_COLOR) || '#000000' },

  saveBackgroundColors(value) { setItem(STORAGE_KEYS.BACKGROUND, value) },
  getBackgroundColors() { return getItem(STORAGE_KEYS.BACKGROUND) || '#0B0E11' },

  saveCategoryColors(value) { setItem(STORAGE_KEYS.CATEGORY, value) },
  getCategoryColors() { return getItem(STORAGE_KEYS.CATEGORY) || '#009DFF' },

  getFontFamily() { return localStorage.getItem(STORAGE_KEYS.FONT) || 'Inter, sans-serif'; },
  saveFontFamily(value) { localStorage.setItem(STORAGE_KEYS.FONT, value); },

  getTextColor() { return localStorage.getItem(STORAGE_KEYS.TEXT_COLOR) || '#FFFFFF'; },
  saveTextColor(value) { localStorage.setItem(STORAGE_KEYS.TEXT_COLOR, value); },

  getProductCardBg() { return localStorage.getItem(STORAGE_KEYS.CARD_BG) || '#1A1E24'; },
  saveProductCardBg(value) { localStorage.setItem(STORAGE_KEYS.CARD_BG, value); },

};