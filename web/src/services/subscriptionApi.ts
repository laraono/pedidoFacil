import { request } from './api';

export const subscriptionApi = {
  post: (data: unknown, planId: number | string | null) =>
    request('/process-order', { method: 'POST', body: JSON.stringify({ data, planId }) }),

  list: (status: string, name: string) =>
    request(`/subscriptions?status=${status}&name=${name}`, { method: 'GET' }),

  getSubscription: (subscriptionId: number) =>
    request(`/subscriptions/${subscriptionId}`, { method: 'GET' }),

  restoreSubscription: (subscriptionId: number, data: unknown) =>
    request(`/process-order/${subscriptionId}`, { method: 'POST', body: JSON.stringify({ data }) }),

  getEstablishmentSubscription: () => request('/subscriptions/establishment', { method: 'GET' }),

  getSubscriptionHistory: () => request('/subscriptions/history', { method: 'GET' }),

  deleteSubscription: (subscriptionId: number) =>
    request(`/subscriptions/${subscriptionId}`, { method: 'DELETE' }),

  updateSubscription: (subscriptionId: number, amount: number) =>
    request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    }),

  cancelSubscription: (subscriptionId: number) =>
    request(`/subscriptions/${subscriptionId}/cancel`, { method: 'POST' }),

  schedulePlan: (planId: number | null) =>
    request('/subscriptions/schedule-plan', {
      method: 'PATCH',
      body: JSON.stringify({ planId }),
    }),
};
