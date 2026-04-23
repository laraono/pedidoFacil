import { request } from './api';

export const metricsApi = {
  getDashboardOverview: (startDate, endDate, filter) => 
    request(`/metrics/dashboard?startDate=${startDate}&endDate=${endDate}&filter=${filter}`, { method: 'GET' }),
  
  getReceiptMetrics: (startDate, endDate) => 
    request(`/metrics/receipts?startDate=${startDate}&endDate=${endDate}`, { method: 'GET' })
};