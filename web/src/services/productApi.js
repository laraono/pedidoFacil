import { request } from './api';

export const productApi = {
  list: () => request('/products', { method: 'GET' }),
  
  listDeleted: () => request('/products?deleted=true', { method: 'GET' }),
  
  create: (data) => request('/products', { 
    method: 'POST', 
    body: data
  }),
  
  update: (id, data) => request(`/products/${id}`, { 
    method: 'PUT', 
    body: data 
  }),
  
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  
  restore: (id) => request(`/products/${id}/restore`, { method: 'PATCH' })
};