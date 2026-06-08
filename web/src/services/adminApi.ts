import { request } from './api';

export interface Plan {
  id: number;
  name: string;
  price: number;
  frequency?: string;
  features?: string;
  mercadoPagoId?: string;
}

export interface PlanForm {
  id: number | null;
  name: string;
  price: string;
  frequency: string;
  features: string;
}

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

export const adminEstablishmentApi = {
  list: () => request('/admin/establishments', { method: 'GET' }),
  getDetail: (id: number) => request(`/admin/establishments/${id}`, { method: 'GET' }),
};

export const adminMetricsApi = {
  getSubscriptionMetrics: (period: '3m' | '6m' | '12m' = '12m') =>
    request(`/admin/metrics/subscriptions?period=${period}`, { method: 'GET' }),
  getMasterId: () => request('/admin/admins/master-id', { method: 'GET' }),
};
