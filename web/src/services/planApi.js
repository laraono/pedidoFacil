import { request } from "./api";

export const planApi = {
    post: async () => {
        

        await request('/plans', { method: 'POST',  body: formData })
    },

    list: async () =>
        await request('/plans', { method: 'GET'}),

    getPlan: async (planId) => {
        await request(`/plans/${planId}`, {method: 'GET'})
    },      

    deleteCategory: async (categoryId) => 
        await request(`/plans/${planId}`, {method: 'DELETE'}),

};