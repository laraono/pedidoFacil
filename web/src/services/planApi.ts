import { request } from './api';

export const planApi = {
  list: () => request('/plans', { method: 'GET' }),
  getPlan: (planId: number) => request(`/plans/${planId}`, { method: 'GET' }),
};
