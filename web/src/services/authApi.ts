import { request } from './api';

export interface LoginResponse {
  accessToken: string;
}

export interface UserProfile {
  usuario: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  estabelecimentoId: number | null;
  cargo: {
    id: number;
    nome: string;
    permissoes: string | string[];
  } | null;
}

export const authApi = {
  login: (email: string, senha: string): Promise<LoginResponse> =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }) as Promise<LoginResponse>,

  checkEmail: (email: string): Promise<{ available: boolean }> =>
    request('/check-email', { method: 'POST', body: JSON.stringify({ email }) }),

  checkCpf: (cpf: string): Promise<{ available: boolean }> =>
    request('/check-cpf', { method: 'POST', body: JSON.stringify({ cpf }) }),

  registerComplete: (data: unknown): Promise<any> =>
    request('/register-complete', { method: 'POST', body: JSON.stringify(data) }),

  logout: (): Promise<unknown> => request('/logout', { method: 'POST' }),

  refresh: (): Promise<LoginResponse> =>
    request('/refresh', { method: 'POST' }) as Promise<LoginResponse>,

  me: (): Promise<UserProfile> => request('/me') as Promise<UserProfile>,

  forgotPassword: (email: string): Promise<{ success: boolean }> =>
    request('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (data: any): Promise<{ message: string }> =>
    request('/reset-password', { method: 'POST', body: JSON.stringify(data) }),
};