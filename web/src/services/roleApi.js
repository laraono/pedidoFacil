import { request } from './api';

export const roleApi = {
  async list() {
    return await request('/roles', { method: 'GET' });
  },

  async create(roleData) {
    const payload = {
      name: roleData.name,
      permissions: roleData.permissions 
    };
    
    return await request('/roles', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async update(id, roleData) {
    const payload = {
      name: roleData.name,
      permissions: roleData.permissions
    };
    
    return await request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async delete(id) {
    await request(`/roles/${id}`, { method: 'DELETE' });
    return true;
  }
};