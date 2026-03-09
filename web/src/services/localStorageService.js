const STORAGE_KEYS = {
  USERS: "users",
  SESSION: "session",
  ONBOARDING: "onboarding",
  IMAGE: "logo",
  BUTTONS: "buttons",
  CATEGORY: "category",
  BACKGROUND: "background"
};

function getItem(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default {
  getUsers() {
    return getItem(STORAGE_KEYS.USERS, []);
  },

  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
  },

  findUser(email, password) {
    return this.getUsers().find(
      u => u.email === email && u.password === password
    );
  },

  setSession(user) {
    setItem(STORAGE_KEYS.SESSION, user);
  },

  getSession() {
    return getItem(STORAGE_KEYS.SESSION);
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  saveOnboarding(data) {
    setItem(STORAGE_KEYS.ONBOARDING, data);
  },

  getOnboarding() {
    return getItem(STORAGE_KEYS.ONBOARDING, {});
  },

  saveImage(base64String) {
    setItem(STORAGE_KEYS.IMAGE, base64String)
  },

  getImage() {
    return getItem(STORAGE_KEYS.IMAGE)
  },

  saveButtonColors(value) {
    setItem(STORAGE_KEYS.BUTTONS, value)
  },

  getButtonColors() {
    return getItem(STORAGE_KEYS.BUTTONS) || '#009DFF'
  },

  saveBackgroundColors(value) {
    setItem(STORAGE_KEYS.BACKGROUND, value)
  },

  getBackgroundColors() {
    return getItem(STORAGE_KEYS.BACKGROUND) || '#0060A9'
  },

  saveCategoryColors(value) {
    setItem(STORAGE_KEYS.CATEGORY, value)
  },

  getCategoryColors() {
    return getItem(STORAGE_KEYS.CATEGORY) || '#009DFF'
  },

};