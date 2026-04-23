import { request } from './api';

export const categoryApi = {
  list: () => request('/categories', { method: 'GET' }),
  
  listDeleted: () => request('/categories?deleted=true', { method: 'GET' }),
  
  create: (data) => request('/categories', { 
    method: 'POST', 
    body: data,
    isMultipart: true 
  }),
  
  update: (id, data) => request(`/categories/${id}`, { 
    method: 'PUT', 
    body: data,
    isMultipart: true 
  }),
  
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  
  restore: (id) => request(`/categories/${id}/restore`, { method: 'PATCH' })
};