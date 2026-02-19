import { defineStore } from 'pinia';
import { loginMock, logoutMock } from '@/mock/authmock';
import { getRolesMock } from '@/mock/rolesmock';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    roles: [],
    isAuthenticated: false,
    configStatus: {
      info: false,
      roles: false,
      menu: false
    }
  }),

  actions: {
    async login({ email, senha }) {
      try {
        const user = await loginMock(email, senha);
        this.user = user;
        this.isAuthenticated = true;
        this.roles = await getRolesMock();
      } catch (err) {
        throw err;
      }
    },

    loadSession() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      this.user = user;
      this.roles = JSON.parse(localStorage.getItem('roles')) || [];
      this.isAuthenticated = true;

      const savedConfigStatus = JSON.parse(localStorage.getItem('configStatus'));
      if (savedConfigStatus) {
        this.configStatus = savedConfigStatus;
      }
    },

    hasPermission(permission) {
      if (!this.user || !this.user.roleId) return false;

      const role = this.roles.find(r => r.id === this.user.roleId);
      if (!role) return false;

      return role.permissions.includes(permission);
    },

    logout() {
      logoutMock();
      this.user = null;
      this.roles = [];
      this.isAuthenticated = false;
      this.configStatus = {
        info: false,
        roles: false,
        menu: false
      };
    },

    setConfigStepComplete(step) {
      if (this.configStatus.hasOwnProperty(step)) {
        this.configStatus[step] = true;

        localStorage.setItem('configStatus', JSON.stringify(this.configStatus));
      }
    }
  }
});
