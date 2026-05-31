import { request } from './api';

export const establishmentApi = {
  checkCnpj: (cnpj: string): Promise<{ available: boolean }> =>
    request('/estabelecimento/check-cnpj', { method: 'POST', body: { cnpj } as any }),

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
