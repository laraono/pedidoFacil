import { request } from "./api";

export const categoryApi = {
    post: (name) =>
        request('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

    list: () =>
        request('/categories', { method: 'GET'}),

    listActive: () => 
        request('/categories/active', { method: 'GET'}),

    putCategory: (categoryId, name, status) =>
        request(`/categories/${categoryId}`, {method: 'PUT', body: JSON.stringify({name, status})}),

    deleteCategory: (categoryId) => 
        request(`/categories/${categoryId}`, {method: 'DELETE'}),

};