import { request } from './api';

export const categoryApi = {
  list: () => request('/categories', { method: 'GET' }),
  
  listDeleted: () => request('/categories?deleted=true', { method: 'GET' }),
  
  create: (data) => request('/categories', { 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id, data) => request(`/categories/${id}`, { 
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  
  restore: (id) => request(`/categories/${id}/restore`, { method: 'PATCH' })
};