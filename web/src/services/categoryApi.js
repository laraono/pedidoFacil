import { request } from "./api";

export const categoryApi = {
    post: async (name, image) => {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('image', image)

        await request('/categories', { method: 'POST',  body: formData })
    },

    list: async () =>
        await request('/categories', { method: 'GET'}),

    listActive: async () => 
        await request('/categories/active', { method: 'GET'}),

    putCategory: async (categoryId, name, status, image) => {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('status', status)
        formData.append('image', image)

        await request(`/categories/${categoryId}`, {method: 'PUT', body: formData})
    },      

    deleteCategory: async (categoryId) => 
        await request(`/categories/${categoryId}`, {method: 'DELETE'}),

};