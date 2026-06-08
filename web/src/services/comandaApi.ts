import { request } from './api';

export const comandaApi = {
  post: (description: string, status: string) =>
    request('/commands', { method: 'POST', body: JSON.stringify({ description, status }) }),

  list: () => request('/commands', { method: 'GET' }),

  listOpen: () => request('/commands/open', { method: 'GET' }),

  listClosed: () => request('/commands/closed', { method: 'GET' }),

  listByStatus: (status: string) => request(`/commands/open?status=${status}`, { method: 'GET' }),

  create: (data: unknown) => request('/commands', { method: 'POST', body: data as BodyInit }),

  addOrder: (comandaId: number | string, data: unknown) =>
    request(`/commands/${Number(comandaId)}/orders`, { method: 'POST', body: data as BodyInit }),

  putStatus: (comandaId: number, status: string) =>
    request(`/commands/${comandaId}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  cancelComanda: (comandaId: number, reason: string) =>
    request(`/commands/${comandaId}`, { method: 'PUT', body: JSON.stringify({ reason }) }),
};
