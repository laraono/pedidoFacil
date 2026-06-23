import { request } from './api';

export const menuApi = {
  getFullMenu: (editMode = false) => {
    const userStr = localStorage.getItem('user');
    let estId: number | null = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        estId = user.estabelecimentoId ?? null;
      } catch {
        throw new Error('Falha ao ler dados do usuário. Faça login novamente.');
      }
    }

    if (!estId) {
      throw new Error('Estabelecimento não identificado. Faça login novamente.');
    }

    return request(`/menu?editMode=${editMode}&establishmentId=${estId}`, { method: 'GET' });
  },
};
