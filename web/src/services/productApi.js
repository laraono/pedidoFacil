import { request } from "./api";

export const productApi = {
    post: (product, productVariations) =>
        request('/products', { method: 'POST', body: JSON.stringify({ product, productVariations}) }),

    listByCategory: (categoryId) =>
        request(`/categories/${categoryId}/products`, { method: 'GET'}),

    list: () => 
        request('/products', {method: 'GET'})
};