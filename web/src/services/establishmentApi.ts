import { request } from './api';

export const establishmentApi = {
  saveOnboardingStep: (data: unknown) =>
    request('/estabelecimento/onboarding', { method: 'POST', body: data as BodyInit }),

  finalizeOnboarding: (data: unknown) =>
    request('/estabelecimento/finalize', { method: 'POST', body: data as BodyInit }),

  getProfile: async () => {
    const data = await request('/estabelecimento/profile', { method: 'GET' });
    return {
      ...data,
      paymentMethods:
        typeof data.paymentMethods === 'string'
          ? JSON.parse(data.paymentMethods)
          : data.paymentMethods || [],
      serviceTypes:
        typeof data.serviceTypes === 'string'
          ? JSON.parse(data.serviceTypes)
          : data.serviceTypes || [],
      configurations: data.configurations || { logo: null },
    };
  },

  updateProfile: (data: unknown) =>
    request('/estabelecimento/profile', { method: 'PUT', body: data as BodyInit }),

  disable: () => request('/estabelecimento/disable', { method: 'DELETE' }),
};
