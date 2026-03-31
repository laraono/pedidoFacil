import { defineStore } from "pinia";
import { authApi } from "@/services/authApi";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Estrutura do user: { id, name, email, estabelecimentoId, cargo: { id, name, permissoes: [] } }
    user: null,
    roles: [],
    isAuthenticated: false,
    configStatus: {
      info: false,
      roles: false,
      menu: false,
    },
  }),

  getters: {
    /**
     * O "Pulo do Gato":
     * Ser Admin não é apenas ter a permissão 'ALL' (que o Gerente também tem).
     * Um Admin de plataforma não possui vínculo com nenhum estabelecimento específico.
     */
    isAdmin: (state) => {
      return (
        state.user?.cargo?.name === "Admin" && !state.user?.estabelecimentoId
      );
    },

    /**
     * Identifica se o usuário é um Gerente ou Staff de um restaurante.
     */
    isGerente: (state) => !!state.user?.estabelecimentoId,

    /**
     * Retorna apenas as permissões do usuário logado.
     */
    userPermissions: (state) => state.user?.cargo?.permissoes || [],
  },

  actions: {
    /**
     * Login padrão (usado na tela de Login)
     */
    async login({ username, senha }) {
      const { accessToken } = await authApi.login(username, senha);
      localStorage.setItem("accessToken", accessToken);

      const perfil = await authApi.me();

      // Garante que as permissões sejam tratadas como Array, independente de como vêm do banco
      const permissoes =
        typeof perfil.cargo.permissoes === "string"
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
        },
      };

      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },

    /**
     * Carrega a sessão do LocalStorage ao atualizar a página (F5)
     */
    loadSession() {
      const token = localStorage.getItem("accessToken");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) return;

      this.user = user;
      this.isAuthenticated = true;

      const savedConfigStatus = JSON.parse(
        localStorage.getItem("configStatus"),
      );
      if (savedConfigStatus) {
        this.configStatus = savedConfigStatus;
      }
    },

    /**
     * Verifica se o usuário tem uma permissão específica.
     * O 'ALL' continua funcionando para dar acesso total às funcionalidades.
     */
    hasPermission(permission) {
      const permissoes = this.user?.cargo?.permissoes;
      if (!permissoes) return false;
      return permissoes.includes("ALL") || permissoes.includes(permission);
    },

    /**
     * Limpa tudo e desloga
     */
    async logout() {
      try {
        await authApi.logout();
      } catch {
        // Ignora erros de rede no logout para garantir que o cliente limpe o estado
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("configStatus");

      this.user = null;
      this.roles = [];
      this.isAuthenticated = false;
      this.configStatus = { info: false, roles: false, menu: false };
    },

    /**
     * Utilitário para atualizar o usuário manualmente (Ex: após o Onboarding)
     */
    setUser(userData) {
      this.user = userData;
      this.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(userData));
    },

    setConfigStepComplete(step) {
      if (Object.prototype.hasOwnProperty.call(this.configStatus, step)) {
        this.configStatus[step] = true;
        localStorage.setItem("configStatus", JSON.stringify(this.configStatus));
      }
    },
  },
});
