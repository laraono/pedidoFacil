import { request } from './api';

export const menuApi = {
  getFullMenu: (editMode = false) => request(`/menu?editMode=${editMode}`, { method: 'GET' })
};