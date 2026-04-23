import { request } from './api';

export const profileApi = {
  get: () => request('/conta', { method: 'GET' }),
  
  update: (data) => request('/conta', { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) 
  }),
  
  changePassword: (data) => request('/conta/senha', { 
    method: 'PATCH', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) 
  })
};