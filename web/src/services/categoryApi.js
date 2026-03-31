import { request } from "./api";

export const categoryApi = {
    post: (name) =>
        request('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

    list: () =>
        request('/categories', { method: 'GET'}),

    listActive: () => 
        request('/categories/active', { method: 'GET'})

};