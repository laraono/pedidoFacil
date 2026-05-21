import { request } from './api';

export const receiptApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return request(`/receipts?${params.toString()}`, { method: 'GET' });
  },

  getMetrics: (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return request(`/metrics/receipts?${params.toString()}`, { method: 'GET' });
  },

  create: (payload) => 
    request('/receipts', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: payload 
    }),

  cancel: (id) => 
    request(`/receipts/${id}`, { method: 'DELETE' })
};