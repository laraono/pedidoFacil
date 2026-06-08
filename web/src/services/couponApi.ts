import { request } from './api';

export const couponApi = {
  list: () => request('/cupons', { method: 'GET' }),

  create: (data: unknown) => request('/cupons', { method: 'POST', body: data as BodyInit }),

  update: (id: number, data: unknown) =>
    request(`/cupons/${id}`, { method: 'PUT', body: data as BodyInit }),

  delete: (id: number) => request(`/cupons/${id}`, { method: 'DELETE' }),

  validate: (code: string) => request(`/cupons/validate/${code}`, { method: 'GET' }),
};
