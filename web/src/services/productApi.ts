import { request } from './api';

export const productApi = {

  list: (params: { page?: number; limit?: number; deleted?: boolean; search?: string } = {}) => {
    const query = new URLSearchParams();
    
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.deleted) query.append('deleted', 'true');
    if (params.search) query.append('search', params.search);
    
    return request(`/products?${query.toString()}`, { method: 'GET' });
  },

  listByCategory: (categoryId: number, page = 1, limit = 10) => 
    request(`/categories/${categoryId}/products?page=${page}&limit=${limit}`, { method: 'GET' }),

  create: (data: FormData | any) => request('/products', { 
    method: 'POST', 
    body: data 
  }),

  update: (id: number, data: FormData | any) => request(`/products/${id}`, { 
    method: 'PUT', 
    body: data 
  }),

  delete: (id: number) => request(`/products/${id}`, { method: 'DELETE' }),

  restore: (id: number) => request(`/products/${id}/restore`, { method: 'PATCH' }),
};