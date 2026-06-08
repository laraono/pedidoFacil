const BASE_URL = import.meta.env.VITE_API_URL as string;

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== '/refresh' && path !== '/login') {
    let newAccessToken: string;
    try {
      const refreshed = await request<{ accessToken: string }>('/refresh', { method: 'POST' });
      newAccessToken = refreshed.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada.');
    }

    headers['Authorization'] = `Bearer ${newAccessToken}`;
    const retry = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
    if (!retry.ok) {
      const retryData = await retry.json().catch(() => ({}));
      throw new Error((retryData as { error?: string }).error || `Erro ${retry.status}`);
    }
    return retry.status === 204 ? null as T : retry.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Erro ${res.status}`);
  }

  return data as T;
}

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
    request<LoginResponse>('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  checkEmail: (email: string): Promise<{ available: boolean }> =>
    request('/check-email', { method: 'POST', body: JSON.stringify({ email }) }),

  checkCpf: (cpf: string): Promise<{ available: boolean }> =>
    request('/check-cpf', { method: 'POST', body: JSON.stringify({ cpf }) }),

  registerComplete: (data: unknown): Promise<any> =>
    request('/register-complete', { method: 'POST', body: JSON.stringify(data) }),

  logout: (): Promise<unknown> => request('/logout', { method: 'POST' }),

  refresh: (): Promise<LoginResponse> => request<LoginResponse>('/refresh', { method: 'POST' }),

  me: (): Promise<UserProfile> => request<UserProfile>('/me'),

  forgotPassword: (email: string): Promise<{ success: boolean }> =>
    request('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (data: any): Promise<{ message: string }> =>
    request('/reset-password', { method: 'POST', body: JSON.stringify(data) }),
};