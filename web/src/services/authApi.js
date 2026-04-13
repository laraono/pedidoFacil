import { request } from "./api";
import { request } from "./api";

export const authApi = {
    login: (email, senha) =>
        request('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

    register: (data) =>
        request('/register', { method: 'POST', body: JSON.stringify(data) }),

    logout: () => request('/logout', { method: 'POST' }),

    refresh: () => request('/refresh', { method: 'POST' }),

    me: () => request('/me'),
};
