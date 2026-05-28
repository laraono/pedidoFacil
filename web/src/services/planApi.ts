import { request } from './api';

export const planApi = {
  post: (data: unknown) =>
    request('/plans', { method: 'POST', body: data as BodyInit }),

  list: () => request('/plans', { method: 'GET' }),

  getPlan: (planId: number) => request(`/plans/${planId}`, { method: 'GET' }),

  deletePlan: (planId: number) => request(`/plans/${planId}`, { method: 'DELETE' }),
};
