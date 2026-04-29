import { request } from "./api";

export const orderApi = {
    post: async (comandaId, status, itens) =>
        await request(`/commands/${comandaId}/orders`, { method: 'POST', body: JSON.stringify({ status, itens}) }),

    listByComanda: async (comandaId) =>
        await request(`/commands/${comandaId}/orders`, { method: 'GET'}),

    list: async () => 
        await request('/orders', {method: 'GET'}),

    putStatus: async (comandaId, orderId, status) => 
        await request(`/commands/${comandaId}/orders/${orderId}`, {method: 'PUT', body: JSON.stringify({status})}),

    getOrder: async (comandaId, orderId) => 
        await request(`/commands/${comandaId}/orders/${orderId}`, {method: 'GET'}),

    cancelOrder: async (comandaId, orderId, cancellationDescription) => 
        await request(`/commands/${comandaId}/orders/${orderId}/cancel`, {method: 'POST', body: JSON.stringify({cancellationDescription})})
};