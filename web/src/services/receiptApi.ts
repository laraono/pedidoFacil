import { request } from './api';

interface ReceiptFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const receiptApi = {
  list: (filters: ReceiptFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return request(`/receipts?${params.toString()}`, { method: 'GET' });
  },

  getMetrics: (startDate: string, endDate: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    return request(`/metrics/receipts?${params.toString()}`, { method: 'GET' });
  },

  create: (payload: unknown) =>
    request('/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload as BodyInit,
    }),

  cancel: (id: number) => request(`/receipts/${id}`, { method: 'DELETE' }),
};
