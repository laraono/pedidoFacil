import { defineStore } from 'pinia';
import { authApi } from '@/services/authApi';

export interface UserCargo {
  id: number;
  name: string;
  permissoes: string[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  estabelecimentoId: number | null;
  cargo: UserCargo;
}

export interface ConfigStatus {
  info: boolean;
  roles: boolean;
  menu: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    roles: [] as unknown[],
    isAuthenticated: false,
    sessionValidated: false,
    configStatus: {
      info: false,
      roles: false,
      menu: false
    } as ConfigStatus
  }),

  getters: {
    isAdmin: (state): boolean => state.user?.cargo?.permissoes?.includes('ALL') ?? false,
  },

  actions: {
    async login({ username, senha }: { username: string; senha: string }): Promise<void> {
      const { accessToken } = await authApi.login(username, senha);
      localStorage.setItem('accessToken', accessToken);

      const perfil = await authApi.me();
      const permissoes: string[] = typeof perfil.cargo.permissoes === 'string'
        ? JSON.parse(perfil.cargo.permissoes)
        : perfil.cargo.permissoes;

      const user: AuthUser = {
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

    loadSession(): void {
      const token = localStorage.getItem('accessToken');
      const userRaw = localStorage.getItem('user');
      const user: AuthUser | null = userRaw ? JSON.parse(userRaw) : null;
      if (!token || !user) return;

      this.user = user;
      this.isAuthenticated = true;

      const configStatusRaw = localStorage.getItem('configStatus');
      const savedConfigStatus: ConfigStatus | null = configStatusRaw ? JSON.parse(configStatusRaw) : null;
      if (savedConfigStatus) {
        this.configStatus = savedConfigStatus;
      }
    },

    async validateSession(): Promise<boolean> {
      if (this.sessionValidated) return this.isAuthenticated;
      this.sessionValidated = true;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        this.isAuthenticated = false;
        return false;
      }

      try {
        const perfil = await authApi.me();
        const permissoes: string[] = typeof perfil.cargo.permissoes === 'string'
          ? JSON.parse(perfil.cargo.permissoes)
          : perfil.cargo.permissoes;

        this.user = {
          id: perfil.usuario.id,
          name: perfil.usuario.nome,
          email: perfil.usuario.email,
          estabelecimentoId: perfil.estabelecimentoId ?? null,
          cargo: { id: perfil.cargo.id, name: perfil.cargo.nome, permissoes },
        };
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      } catch {
        return false;
      }
    },

    hasPermission(permission: string): boolean {
      const permissoes = this.user?.cargo?.permissoes;
      if (!permissoes) return false;
      return permissoes.includes('ALL') || permissoes.includes(permission);
    },

    async logout(): Promise<void> {
      try {
        await authApi.logout();
      } catch {
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      this.user = null;
      this.roles = [];
      this.isAuthenticated = false;
      this.configStatus = { info: false, roles: false, menu: false };
    },

    setConfigStepComplete(step: string): void {
      if (Object.prototype.hasOwnProperty.call(this.configStatus, step)) {
        (this.configStatus as Record<string, boolean>)[step] = true;
        localStorage.setItem('configStatus', JSON.stringify(this.configStatus));
      }
    }
  }
});
