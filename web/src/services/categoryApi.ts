import { request } from './api';

export const categoryApi = {
  list: () => request('/categories', { method: 'GET' }),

  listInactive: () => request('/categories?inactive=true', { method: 'GET' }),

  create: (data: FormData) => request('/categories', { method: 'POST', body: data, isMultipart: true }),

  update: (id: number, data: FormData) =>
    request(`/categories/${id}`, { method: 'PUT', body: data, isMultipart: true }),

  deactivate: (id: number) => request(`/categories/${id}/deactivate`, { method: 'PATCH' }),

  reactivate: (id: number) => request(`/categories/${id}/reactivate`, { method: 'PATCH' }),

  delete: (id: number) => request(`/categories/${id}`, { method: 'DELETE' }),
};
