import { request } from './api';

export const paymentApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate)   params.append('endDate',   filters.endDate);
    if (filters.status)    params.append('status',    filters.status);
    return request(`/payments?${params.toString()}`, { method: 'GET' });
  },
};

export const receiptApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status)    params.append('status',    filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate)   params.append('endDate',   filters.endDate);
    return request(`/receipts?${params.toString()}`, { method: 'GET' });
  },

  getMetrics: (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return request(`/metrics/receipts?${params.toString()}`, { method: 'GET' });
  },

  create: (payload) =>
    request('/receipts', {
      method: 'POST',
      body: payload,
    }),

  cancel: (id) =>
    request(`/receipts/${id}`, { method: 'DELETE' }),

  reissue: (id) =>
    request(`/receipts/${id}/reissue`, { method: 'POST' }),

  openDanfe: (urlDanfe) => {
    if (!urlDanfe) throw new Error('URL do DANFE não disponível para esta nota.');
    window.open(urlDanfe, '_blank');
  },
};