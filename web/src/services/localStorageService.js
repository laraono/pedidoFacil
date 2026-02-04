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
  // Usuários
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

  // Sessão
  setSession(user) {
    setItem(STORAGE_KEYS.SESSION, user);
  },

  getSession() {
    return getItem(STORAGE_KEYS.SESSION);
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Onboarding
  saveOnboarding(data) {
    setItem(STORAGE_KEYS.ONBOARDING, data);
  },

  getOnboarding() {
    return getItem(STORAGE_KEYS.ONBOARDING, {});
  }
};

function initMockData() {
  const users = localStorage.getItem("users");

  if (!users) {
    const defaultUser = [
      {
        id: 1,
        name: "Admin",
        email: "admin@email.com",
        password: "123456",
        role: "ADMIN"
      }
    ];

    localStorage.setItem("users", JSON.stringify(defaultUser));
  }
}

initMockData();
