import { defineStore } from "pinia";
import {
  loginMock,
  getSessionMock,
  logoutMock
} from "@/services/mock";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),

  actions: {
    login({ email, senha }) {
      const user = loginMock(email, senha);
      if (!user) {
        throw new Error("Credenciais inválidas");
      }
      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },

    loadSession() {
      const user = getSessionMock();
      if (user) {
        this.user = user;
        this.isAuthenticated = true;
      }
    },

    logout() {
      localStorage.removeItem("user");
      this.user = null;
      this.isAuthenticated = false;
    }
  }
});
