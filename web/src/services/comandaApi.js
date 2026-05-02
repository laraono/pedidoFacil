import { request } from "./api";

export const comandaApi = {
    post: async (description, status) =>
        await request('/commands', { method: 'POST', body: JSON.stringify({ description, status}) }),

    list: async () =>
        await request('/commands', { method: 'GET'}),

    listOpen: async () => 
        await request('/commands/open', {method: 'GET'}),

    listClosed: async () => 
        await request('/commands/closed', {method: 'GET'}),

    putStatus: async (comandaId, status) => 
        await request(`/commands/${comandaId}`, {method: 'PUT', body: JSON.stringify({status})}),

    cancelComanda: async (comandaId, reason) => 
        await request(`/commands/${comandaId}`, {method: 'PUT', body: JSON.stringify({reason})})
};import { request } from './api';

export const comandaApi = {
  create: (data) => request('/commands', { 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  addOrder: (comandaId, data) => request(`/commands/${Number(comandaId)}/orders`, { 
    method: 'POST',
    body: JSON.stringify(data)
  }),

  list: () => request('/commands', { method: 'GET' }),
  
  listByStatus: (status) => request(`/commands/open?status=${status}`, { method: 'GET' })
};