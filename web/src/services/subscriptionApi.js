import { request } from "./api";

export const subscriptionApi = {
    post: async (data, planId) => {
        await request(`/process-order`, { method: 'POST',  body: JSON.stringify({data, planId}) })
    },

    list: async (status, name) =>
        await request(`/subscriptions?status=${status}&?name=${name}`, { method: 'GET'}),

    getsubscription: async (subscriptionId) => {
        await request(`/subscriptions/${subscriptionId}`, {method: 'GET'})
    },      

    deleteSubscription: async (subscriptionId) => 
        await request(`/subscriptions/${subscriptionId}`, {method: 'DELETE'}),

    updateSubscription: async (subscriptionId, amount) => 
        await request(`/subscriptions/${subscriptionId}`, {method: 'PUT', body: JSON.stringify({amount})}),

    cancelSubscription: async (subscriptionId) => 
        await request(`/subscriptions/${subscriptionId}/cancel`, {method: 'POST'}),


};