import { request } from './api';

interface PaymentPayload {
  payment: { type: string; amount: number };
  selectedOrderIds: number[];
  isLastPayment: boolean;
  discountType: string | null;
  discountValue: number | null;
  couponId: number | null;
}

export const comandaApi = {
  post: (description: string, status: string) =>
    request('/commands', { method: 'POST', body: JSON.stringify({ description, status }) }),

  list: () => request('/commands', { method: 'GET' }),

  listOpen: () => request('/commands/open', { method: 'GET' }),

  listClosed: () => request('/commands/closed', { method: 'GET' }),

  create: (data: unknown) => request('/commands', { method: 'POST', body: data as BodyInit }),

  addOrder: (comandaId: number | string, data: unknown, idempotencyKey?: string) =>
    request(`/commands/${Number(comandaId)}/orders`, {
      method: 'POST',
      body: data as BodyInit,
      headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
    }),

  putStatus: (comandaId: number, status: string) =>
    request(`/commands/${comandaId}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  cancel: (comandaId: number, reason: string, userId: number) =>
    request(`/commands/${comandaId}/cancel`, { method: 'POST', body: JSON.stringify({ reason, userId }) }),

  pay: (comandaId: number, payload: PaymentPayload) =>
    request(`/commands/${comandaId}/payment`, { method: 'POST', body: JSON.stringify(payload) }),
};
