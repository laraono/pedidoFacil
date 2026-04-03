import { request } from "./api";

export const productApi = {
    post: (product, productVariations) =>
        request('/products', { method: 'POST', body: JSON.stringify({ product, productVariations}) }),

    listByCategory: (categoryId) =>
        request(`/categories/${categoryId}/products`, { method: 'GET'}),

    listActiveByCategory: (categoryId) =>
        request(`/categories/${categoryId}/products/active`, { method: 'GET'}),

    list: () => 
        request('/products', {method: 'GET'}),

    deleteProduct: (categoryId, productId) => 
        request(`/categories/${categoryId}/products/${productId}`, { method: 'DELETE'}),

    putProduct: (categoryId, productId, product, productVariations) =>
        request(`/categories/${categoryId}/products/${productId}`, { method: 'PUT', body: JSON.stringify({ product, productVariations})}),

    putStatus: (categoryId, productId, status) =>
        request(`/categories/${categoryId}/products/${productId}/status`, { method: 'PUT', body: JSON.stringify({ status })}),


};