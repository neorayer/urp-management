import api from '@/lib/api';
import { Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '@/types';

export const roleApi = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/admin/roles');
    return response.data;
  },
  
  getRoleById: async (id: number): Promise<Role> => {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
  },
  
  createRole: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await api.post('/admin/roles', data);
    return response.data;
  },
  
  updateRole: async (id: number, data: UpdateRoleRequest): Promise<Role> => {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  },
  
  updateRolePermissions: async (
    id: number,
    permissionIds: number[]
  ): Promise<Role> => {
    const response = await api.put(`/admin/roles/${id}/permissions`, permissionIds);
    return response.data;
  },
  
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/admin/roles/${id}`);
  },
};

export const permissionApi = {
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data;
  },
};
