import FormData from 'form-data';

const BASE_URL = 'http://localhost:3000/api/v1';

export function getToken() {
    return localStorage.getItem('accessToken');
}

export async function request(path: string, options: RequestInit & { headers?: Record<string, string> } = {}) {
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = { ...options.headers };
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = options.body;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        body,
        headers,
        credentials: 'include',
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && path !== '/refresh' && path !== '/login') {
        try {
            const refreshed = await request('/refresh', { method: 'POST' });
            localStorage.setItem('accessToken', refreshed.accessToken);
            headers['Authorization'] = `Bearer ${refreshed.accessToken}`;

            const retryBody = options.body;

            const retry = await fetch(`${BASE_URL}${path}`, {
                ...options,
                body: retryBody,
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
