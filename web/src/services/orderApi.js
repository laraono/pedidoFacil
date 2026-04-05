import { request } from "./api";

export const orderApi = {
    post: async (comandaId, status, itens) =>
        await request(`/commands/${comandaId}/orders`, { method: 'POST', body: JSON.stringify({ status, itens}) }),

    listByComanda: async () =>
        await request(`/commands/${comandaId}/orders`, { method: 'GET'}),

    list: async () => 
        await request('/orders', {method: 'GET'}),

    putStatus: async (comandaId, orderId, status) => 
        await request(`/commands/${comandaId}/orders/${orderId}`, {method: 'PUT', body: JSON.stringify({status})}),

    cancelOrder: async (comandaId, orderId, cancellationDescription) => 
        await request(`/commands/${comandaId}/orders/${orderId}/cancel`, {method: 'POST', body: JSON.stringify({cancellationDescription})})
};