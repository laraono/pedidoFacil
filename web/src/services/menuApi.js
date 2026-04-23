import { request } from './api';

export const menuApi = {
  getFullMenu: (editMode = false) => {
    const userStr = localStorage.getItem("user");
    let estId = 1; 
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            estId = user.estabelecimento || user.id || 1; 
        } catch (e) {
            console.warn("Falha ao ler usuário do localStorage");
        }
    }

    return request(`/menu?editMode=${editMode}&establishmentId=${estId}`, { method: 'GET' });
  }
};