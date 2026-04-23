import { request } from './api';

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