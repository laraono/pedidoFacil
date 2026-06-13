const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let refreshPromise: Promise<any> | null = null;

export function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

interface CustomRequestInit extends RequestInit {
  isMultipart?: boolean;
}

function isFormDataObj(data: any): boolean {
  if (!data) return false;
  return (
    data instanceof FormData ||
    (data.constructor && data.constructor.name === 'FormData') ||
    typeof data.append === 'function'
  );
}



export async function request(path: string, options: CustomRequestInit = {}) {
  const isFormData = options.isMultipart === true || isFormDataObj(options.body);

  const headers: Record<string, string> = { ...((options.headers as Record<string, string>) || {}) };
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body =
    !isFormData && options.body !== null && options.body !== undefined && typeof options.body === 'object'
      ? JSON.stringify(options.body)
      : options.body;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return null;

  if (res.status === 402) return;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== '/refresh' && path !== '/login') {
    if (!getToken()) {
      const err: any = new Error(data.message || data.error || `Erro ${res.status}`);
      err.data = data;
      throw err;
    }
    try {
      if (!refreshPromise) {
        refreshPromise = request('/refresh', { method: 'POST' }).finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      localStorage.setItem('accessToken', refreshed.accessToken);
      headers['Authorization'] = `Bearer ${refreshed.accessToken}`;

      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        body,
        headers,
        credentials: 'include',
      });

      if (retry.status === 204) return null;

      if (retry.status === 402) return;

      if (!retry.ok) {
        const retryData = await retry.json().catch(() => ({}));
        throw new Error(retryData.message || retryData.error || `Erro ${retry.status}`);
      }
      return retry.json();
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return new Promise(() => {});
    }
  }

  if (!res.ok) {
    const err: any = new Error(data.message || data.error || `Erro ${res.status}`);
    err.data = data;
    throw err;
  }

  return data;
}
