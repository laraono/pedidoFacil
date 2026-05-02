import { request } from './api';

export const productApi = {
  list: () => request('/products', { method: 'GET' }),
  
  listDeleted: () => request('/products?deleted=true', { method: 'GET' }),
  
  create: (data) => request('/products', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  
  update: (id, data) => request(`/products/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  
  restore: (id) => request(`/products/${id}/restore`, { method: 'PATCH' })
};import { request } from "./api";

export const productApi = {
    post: async (product, productVariations, image) =>{
        const formData = new FormData()
        formData.append('product', product)
        formData.append('productVariations', productVariations)
        formData.append('image', image)

        await request('/products', { method: 'POST', body: formData })
    },
    listByCategory: async (categoryId) =>
        await request(`/categories/${categoryId}/products`, { method: 'GET'}),

    listActiveByCategory: async (categoryId) =>
        await request(`/categories/${categoryId}/products/active`, { method: 'GET'}),

    list: async () => 
        await request('/products', {method: 'GET'}),

    deleteProduct: async (categoryId, productId) => 
        await request(`/categories/${categoryId}/products/${productId}`, { method: 'DELETE'}),

    putProduct: async (categoryId, productId, product, productVariations, image) =>{
        const formData = new FormData()
        formData.append('product', product)
        formData.append('productVariations', productVariations)
        formData.append('image', image)

        await request(`/categories/${categoryId}/products/${productId}`, { method: 'PUT', body: formData})
    },
    putStatus: async (categoryId, productId, status) =>
        await request(`/categories/${categoryId}/products/${productId}/status`, { method: 'PUT', body: JSON.stringify({ status })}),


};