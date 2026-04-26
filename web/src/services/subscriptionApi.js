import { request } from "./api";

export const subscriptionApi = {
    post: async (data, planId) => {
        await request(`/process-order`, { method: 'POST',  body: JSON.stringify({data, planId}) })
    },

    list: async () =>
        await request('/subscriptions', { method: 'GET'}),

    getsubscription: async (subscriptionId) => {
        await request(`/subscriptions/${subscriptionId}`, {method: 'GET'})
    },      

    deleteCategory: async (categoryId) => 
        await request(`/subscriptions/${subscriptionId}`, {method: 'DELETE'}),

};