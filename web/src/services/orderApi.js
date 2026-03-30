import { request } from "./api";

export const orderApi = {
    post: (comandaId, status, itens) =>
        request(`/commands/${comandaId}/orders`, { method: 'POST', body: JSON.stringify({ status, itens}) }),

    listByComanda: () =>
        request(`/commands/${comandaId}/orders`, { method: 'GET'}),

    list: () => 
        request('/orders', {method: 'GET'}),

    putStatus: (comandaId, orderId, status) => 
        request(`/commands/${comandaId}/orders/${orderId}`, {method: 'PUT', body: JSON.stringify({status})})
};