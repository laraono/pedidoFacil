import { request } from './api';

export const roleApi = {
  async list() {
    const data = await request('/roles', { method: 'GET' });
    
    return data.map(role => ({
      ...role,
      permissions: typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : (role.permissions || [])
    }));
  },

  async create(roleData) {
    const payload = {
      name: roleData.name,
      permissions: roleData.permissions 
    };
    
    const data = await request('/roles', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data;
  },

  async update(id, roleData) {
    const payload = {
      name: roleData.name,
      permissions: roleData.permissions
    };
    
    const data = await request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return data;
  },

  async delete(id) {
    await request(`/roles/${id}`, { method: 'DELETE' });
    return true;
  }
};