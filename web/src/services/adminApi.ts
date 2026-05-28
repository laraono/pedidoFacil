import { request } from './api';

export const adminPlanApi = {
  listPublic: () => request('/admin/public/plans', { method: 'GET' }),

  list: () => request('/admin/plans', { method: 'GET' }),

  get: (planId: number) => request(`/admin/plans/${planId}`, { method: 'GET' }),

  create: (data: Record<string, unknown>) =>
    request('/admin/plans', { method: 'POST', body: JSON.stringify(data) }),

  update: (planId: number, data: Record<string, unknown>) =>
    request(`/admin/plans/${planId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (planId: number) => request(`/admin/plans/${planId}`, { method: 'DELETE' }),
};

export const adminUserApi = {
  list: () => request('/admin/admins', { method: 'GET' }),

  get: (adminId: number) => request(`/admin/admins/${adminId}`, { method: 'GET' }),

  create: (data: Record<string, unknown>) =>
    request('/admin/admins', { method: 'POST', body: JSON.stringify(data) }),

  update: (adminId: number, data: Record<string, unknown>) =>
    request(`/admin/admins/${adminId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (adminId: number) => request(`/admin/admins/${adminId}`, { method: 'DELETE' }),
};

export const adminSubscriptionApi = {
  list: () => request('/admin/subscriptions', { method: 'GET' }),

  get: (subscriptionId: number) =>
    request(`/admin/subscriptions/${subscriptionId}`, { method: 'GET' }),

  updatePrice: (subscriptionId: number, amount: number) =>
    request(`/admin/subscriptions/${subscriptionId}/price`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    }),

  cancel: (subscriptionId: number) =>
    request(`/admin/subscriptions/${subscriptionId}/cancel`, { method: 'POST' }),

  delete: (subscriptionId: number) =>
    request(`/admin/subscriptions/${subscriptionId}`, { method: 'DELETE' }),
};

export const adminMetricsApi = {
  getSubscriptionMetrics: () => request('/admin/metrics/subscriptions', { method: 'GET' }),
};
