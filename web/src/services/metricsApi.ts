import { request } from './api';

export const metricsApi = {
  getDashboardOverview: (startDate: string, endDate: string, filter: string) =>
    request(`/metrics/dashboard?startDate=${startDate}&endDate=${endDate}&filter=${filter}`, {
      method: 'GET',
    }),

  getReceiptMetrics: (startDate: string, endDate: string) =>
    request(`/metrics/receipts?startDate=${startDate}&endDate=${endDate}`, { method: 'GET' }),
};
