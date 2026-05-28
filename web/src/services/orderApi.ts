import { request } from './api';

export const orderApi = {
  post: (comandaId: number, status: string, itens: unknown[]) =>
    request(`/commands/${comandaId}/orders`, {
      method: 'POST',
      body: JSON.stringify({ status, itens }),
    }),

  listByComanda: (comandaId: number) =>
    request(`/commands/${comandaId}/orders`, { method: 'GET' }),

  list: () => request('/orders', { method: 'GET' }),

  putStatus: (comandaId: number, orderId: number, status: string) =>
    request(`/commands/${comandaId}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  cancelOrder: (comandaId: number, orderId: number, cancellationDescription: string) =>
    request(`/commands/${comandaId}/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancellationDescription }),
    }),
};
