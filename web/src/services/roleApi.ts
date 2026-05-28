import { request } from './api';

interface RoleData {
  name: string;
  permissions: string[];
}

export const roleApi = {
  list: () => request('/roles', { method: 'GET' }),

  create: (roleData: RoleData) =>
    request('/roles', {
      method: 'POST',
      body: { name: roleData.name, permissions: roleData.permissions } as unknown as BodyInit,
    }),

  update: (id: number, roleData: RoleData) =>
    request(`/roles/${id}`, {
      method: 'PUT',
      body: { name: roleData.name, permissions: roleData.permissions } as unknown as BodyInit,
    }),

  delete: async (id: number) => {
    await request(`/roles/${id}`, { method: 'DELETE' });
    return true;
  },
};
