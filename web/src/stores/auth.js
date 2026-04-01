import { defineStore } from 'pinia';
import { authApi } from '@/services/authApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // user: { id, name, email, cargo: { id, name, permissoes: string[] } }
    user: null,
    roles: [],   // mantido para compatibilidade com telas de gestão de cargos
    isAuthenticated: false,
    configStatus: {
      info: false,
      roles: false,
      menu: false
    }
  }),

  getters: {
    isAdmin: (state) => state.user?.cargo?.permissoes?.includes('ALL') ?? false,
  },

  actions: {
    async login({ username, senha }) {
      const { accessToken } = await authApi.login(username, senha);
      localStorage.setItem('accessToken', accessToken);

      const perfil = await authApi.me();
      const permissoes = typeof perfil.cargo.permissoes === 'string'
        ? JSON.parse(perfil.cargo.permissoes)
        : perfil.cargo.permissoes;

      const user = {
        id: perfil.usuario.id,
        name: perfil.usuario.nome,
        email: perfil.usuario.email,
        estabelecimentoId: perfil.estabelecimentoId ?? null,
        cargo: {
          id: perfil.cargo.id,
          name: perfil.cargo.nome,
          permissoes,
        }
      };

      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
    },

    loadSession() {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!token || !user) return;

      this.user = user;
      this.isAuthenticated = true;

      const savedConfigStatus = JSON.parse(localStorage.getItem('configStatus'));
      if (savedConfigStatus) {
        this.configStatus = savedConfigStatus;
      }
    },

    hasPermission(permission) {
      const permissoes = this.user?.cargo?.permissoes;
      if (!permissoes) return false;
      return permissoes.includes('ALL') || permissoes.includes(permission);
    },

    async logout() {
      try {
        await authApi.logout();
      } catch {
        // ignora erros de rede no logout
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      this.user = null;
      this.roles = [];
      this.isAuthenticated = false;
      this.configStatus = { info: false, roles: false, menu: false };
    },

    setConfigStepComplete(step) {
      if (Object.prototype.hasOwnProperty.call(this.configStatus, step)) {
        this.configStatus[step] = true;
        localStorage.setItem('configStatus', JSON.stringify(this.configStatus));
      }
    }
  }
});
