import storage from "./localStorageService";

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  [key: string]: unknown;
}

export default {
  async login(data: LoginData) {
    const user = storage.findUser(data.email, data.password);

    if (!user) {
      throw new Error("Usuário ou senha inválidos");
    }

    storage.setSession(user);
    return { data: user };
  },

  async register(data: unknown) {
    storage.saveUser(data as import('./localStorageService').StoredUser);
    return { data };
  },

  async logout(): Promise<void> {
    storage.clearSession();
  },

  async saveOnboarding(data: OnboardingData) {
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
