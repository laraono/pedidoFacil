const BASE_URL = '/api/v1';

function getToken() {
  return localStorage.getItem('accessToken');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== '/refresh' && path !== '/login') {
    // Tenta renovar o token e repetir
    try {
      const refreshed = await request('/refresh', { method: 'POST' });
      localStorage.setItem('accessToken', refreshed.accessToken);
      headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      if (!retry.ok) {
        const retryData = await retry.json().catch(() => ({}));
        throw new Error(retryData.error || `Erro ${retry.status}`);
      }
      return retry.status === 204 ? null : retry.json();
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada.');
    }
  }

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
}

export const authApi = {
  login: (email, senha) =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  register: (data) =>
    request('/register', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request('/logout', { method: 'POST' }),

  refresh: () => request('/refresh', { method: 'POST' }),

  me: () => request('/me'),
};
