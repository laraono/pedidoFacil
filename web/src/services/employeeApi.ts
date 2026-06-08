import { request } from './api';

export const employeeApi = {
  list: () => request('/funcionario', { method: 'GET' }),

  listInactive: () => request('/funcionario/inactive', { method: 'GET' }),

  create: (data: unknown) => request('/funcionario', { method: 'POST', body: data as BodyInit }),

  update: (id: number, data: unknown) =>
    request(`/funcionario/${id}`, { method: 'PUT', body: data as BodyInit }),

  delete: (id: number) => request(`/funcionario/${id}`, { method: 'DELETE' }),

  reactivate: (id: number) => request(`/funcionario/${id}/reactivate`, { method: 'PATCH' }),

  permanentDelete: (id: number) => request(`/funcionario/${id}/permanent`, { method: 'DELETE' }),
};
