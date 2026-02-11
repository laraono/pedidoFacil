const STORAGE_KEYS = {
  USERS: "users",
  SESSION: "session",
  ONBOARDING: "onboarding"
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
  }
};