import { request } from './api';

export const subscriptionApi = {
  restoreSubscription: (subscriptionId: number, data: unknown) =>
    request(`/process-order/${subscriptionId}`, { method: 'POST', body: JSON.stringify(data) }),

  getEstablishmentSubscription: () => request('/subscriptions/establishment', { method: 'GET' }),

  getSubscriptionHistory: () => request('/subscriptions/history', { method: 'GET' }),

  cancelSubscription: (subscriptionId: number) =>
    request(`/subscriptions/${subscriptionId}/cancel`, { method: 'POST' }),

  changePlan: (planId: number) =>
    request('/subscriptions/change-plan', {
      method: 'PATCH',
      body: JSON.stringify({ planId }),
    }),
};
