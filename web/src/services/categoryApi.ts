import { request } from './api';

export const categoryApi = {
  list: () => request('/categories', { method: 'GET' }),

  listDeleted: () => request('/categories?deleted=true', { method: 'GET' }),

  create: (data: FormData) => request('/categories', { method: 'POST', body: data, isMultipart: true }),

  update: (id: number, data: FormData) =>
    request(`/categories/${id}`, { method: 'PUT', body: data, isMultipart: true }),

  delete: (id: number) => request(`/categories/${id}`, { method: 'DELETE' }),

  restore: (id: number) => request(`/categories/${id}/restore`, { method: 'PATCH' }),
};
