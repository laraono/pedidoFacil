import storage from "./localStorageService";

export default {
  async login(data) {
    const user = storage.findUser(data.email, data.password);

    if (!user) {
      throw new Error("Usuário ou senha inválidos");
    }

    storage.setSession(user);
    return { data: user };
  },

  async register(data) {
    storage.saveUser(data);
    return { data };
  },

  async logout() {
    storage.clearSession();
  },

  async saveOnboarding(data) {
    storage.saveOnboarding(data);
    return { data };
  },

  async getOnboarding() {
    return { data: storage.getOnboarding() };
  },

  async getSession() {
    return { data: storage.getSession() };
  }
};
