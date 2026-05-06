import FormData from 'form-data';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  [key: string]: unknown;
}

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

const SUBSCRIPTION_GUARDED_ROUTES = ['/app/kitchen', '/app/menu', '/app/cashier', '/app/reports'];

function handleSubscriptionBlock(message: string) {
    localStorage.setItem('subscriptionError', message);
    const isGuarded = SUBSCRIPTION_GUARDED_ROUTES.some(
        r => window.location.pathname === r || window.location.pathname.startsWith(r + '/')
    );
    if (isGuarded) {
        window.dispatchEvent(new CustomEvent('subscription-blocked', { detail: { message } }));
    }
}

export async function request(path, options = {}) {
    const isFormData = options.body instanceof FormData;

    const headers = { ...options.headers };
    if (!isFormData && !options.headers?.['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body = options.body;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        body,
        headers,
        credentials: 'include',
    });

    if (res.status === 204) return null;

    if (res.status === 402) {
        const errData = await res.json().catch(() => ({}));
        handleSubscriptionBlock(errData.message || 'Assinatura inativa');
        return;
    }

    localStorage.setItem('subscriptionError', '')
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && path !== '/refresh' && path !== '/login') {
        try {
            const refreshed = await request('/refresh', { method: 'POST' });
            localStorage.setItem('accessToken', refreshed.accessToken);
            headers['Authorization'] = `Bearer ${refreshed.accessToken}`;

            let retryBody = options.body;
            if (!isFormData && retryBody && typeof retryBody === 'object' && !(retryBody instanceof FormData)) {
                retryBody = JSON.stringify(retryBody);
            }

            const retry = await fetch(`${BASE_URL}${path}`, {
                ...options,
                body: retryBody,
                headers,
                credentials: 'include',
            });

            if (retry.status === 204) return null;

            // Se o retry retornar 402 (assinatura bloqueada), exibe modal — não redireciona ao login
            if (retry.status === 402) {
                const errData = await retry.json().catch(() => ({}));
                handleSubscriptionBlock(errData.message || 'Assinatura inativa');
                return;
            }

            if (!retry.ok) {
                const retryData = await retry.json().catch(() => ({}));
                throw new Error(retryData.error || `Erro ${retry.status}`);
            }
            return retry.json();
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

