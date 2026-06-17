import { defineStore } from 'pinia';
import { authApi, UserProfile } from '@/services/authApi';

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
  cargo: UserCargo | null; 
  isAdmin: boolean;
}

export interface ConfigStatus {
  info: boolean;
  roles: boolean;
  menu: boolean;
}

function parseCargo(cargo: UserProfile['cargo']): UserCargo | null {
  if (!cargo) return null;
  const permissoes: string[] = cargo.permissoes
    ? typeof cargo.permissoes === 'string'
      ? JSON.parse(cargo.permissoes)
      : cargo.permissoes
    : [];
  return { id: cargo.id, name: cargo.nome, permissoes };
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
    isAdmin: (state): boolean => state.user?.isAdmin ?? false,
  },

  actions: {
    async login({ username, senha }: { username: string; senha: string }): Promise<void> {
      const { accessToken } = await authApi.login(username, senha);
      localStorage.setItem('accessToken', accessToken);

      const perfil = await authApi.me();
      
      const user: AuthUser = {
        id: perfil.usuario.id,
        name: perfil.usuario.name,
        email: perfil.usuario.email,
        estabelecimentoId: perfil.estabelecimentoId ?? null,
        isAdmin: !!perfil.usuario.isAdmin,
        cargo: parseCargo(perfil.cargo),
      };

      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
    },

    loadSession(): void {
      const token = localStorage.getItem('accessToken');
      const userRaw = localStorage.getItem('user');

      let user: AuthUser | null = null;
      try {
        user = userRaw ? JSON.parse(userRaw) : null;
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        return;
      }

      if (!token || !user) return;

      this.user = user;
      this.isAuthenticated = true;

      const configStatusRaw = localStorage.getItem('configStatus');
      try {
        const savedConfigStatus: ConfigStatus | null = configStatusRaw ? JSON.parse(configStatusRaw) : null;
        if (savedConfigStatus) {
          this.configStatus = savedConfigStatus;
        }
      } catch {
        localStorage.removeItem('configStatus');
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
        
        this.user = {
          id: perfil.usuario.id,
          name: perfil.usuario.name,
          email: perfil.usuario.email,
          estabelecimentoId: perfil.estabelecimentoId ?? null,
          isAdmin: !!perfil.usuario.isAdmin,
          cargo: parseCargo(perfil.cargo),
        };

        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      } catch (error) {
        this.isAuthenticated = false;
        return false;
      }
    },

    setUserFromOnboarding(response: {
      usuario: { id: number; nome: string; email: string };
      cargo: UserProfile['cargo'];
      estabelecimentoId: number | null;
    }): void {
      const user: AuthUser = {
        id: response.usuario.id,
        name: response.usuario.nome,
        email: response.usuario.email,
        estabelecimentoId: response.estabelecimentoId ?? null,
        isAdmin: false,
        cargo: parseCargo(response.cargo),
      };
      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
    },

    hasPermission(permission: string): boolean {
      if (this.isAdmin) return true;
      
      const permissoes = this.user?.cargo?.permissoes;
      if (!permissoes) return false;
      
      return permissoes.includes(permission);
    },

    async logout(): Promise<void> {
      try {
        await authApi.logout();
      } catch (error) {}

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      this.user = null;
      this.roles = [];
      this.isAuthenticated = false;
      this.sessionValidated = false;
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