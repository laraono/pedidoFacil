import { defineStore } from "pinia";
import {
  loginMock,
  getSessionMock
} from "@/mock/authmock";
import {
  getConfigStatusMock,
  saveConfigStatusMock
} from "@/mock/configStatusmock";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    configStatus: {
      establishment: false,
      roles: false,
      menu: false
    }
  }),

  actions: {
    login({ email, senha }) {
      const user = loginMock(email, senha);
      if (!user) throw new Error("Credenciais inválidas");

      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));

      const status = getConfigStatusMock();
      if (status) this.configStatus = status;
    },

    loadSession() {
      const user = getSessionMock();
      if (user) {
        this.user = user;
        this.isAuthenticated = true;

        const status = getConfigStatusMock();
        if (status) this.configStatus = status;
      }
    },

    setConfigStepComplete(step) {
      this.configStatus[step] = true;
      saveConfigStatusMock(this.configStatus);
    },

    logout() {
      localStorage.removeItem("user");
      this.user = null;
      this.isAuthenticated = false;
    }
  }
});
