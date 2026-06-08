import { request } from './api';

export const profileApi = {
  get: () => request('/conta', { method: 'GET' }),

  update: (data: unknown) =>
    request('/conta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data as BodyInit,
    }),

  changePassword: (data: unknown) =>
    request('/conta/senha', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data as BodyInit,
    }),
};
