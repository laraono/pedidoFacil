import { request } from './api';

export const registerApi = {
  post: (name: string) =>
    request('/estabelecimento/registers', {
      method: 'POST',
      body: JSON.stringify(name),
    }),

  list: () => request('/estabelecimento/registers', { method: 'GET' }),

  associate: (registerId: number) =>
    request('/estabelecimento/registers/associate', {
      method: 'POST',
      body: JSON.stringify(registerId),
    }),
};
