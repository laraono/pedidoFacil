import { request } from "./api";

export const comandaApi = {
    post: (description, status) =>
        request('/commands', { method: 'POST', body: JSON.stringify({ description, status}) }),

    list: () =>
        request('/commands', { method: 'GET'}),

    listOpen: () => 
        request('/commands/open', {method: 'GET'}),

    listClosed: () => 
        request('/commands/closed', {method: 'GET'}),

    putStatus: (comandaId, status) => 
        request(`/commands/${comandaId}`, {method: 'PUT', body: JSON.stringify({status})}),

    cancelComanda: (comandaId, reason) => 
        request(`/commands/${comandaId}`, {method: 'PUT', body: JSON.stringify({reason})})
};