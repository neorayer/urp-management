import api from '@/lib/api';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStatus,
  PageResponse,
  User,
} from '@/types';

export const tenantApi = {
  searchTenants: async (params: {
    query?: string;
    status?: TenantStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Tenant>> => {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
  },
  
  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data;
  },
  
  getTenantBySlug: async (slug: string): Promise<Tenant> => {
    const response = await api.get(`/admin/tenants/slug/${slug}`);
    return response.data;
  },
  
  createTenant: async (data: CreateTenantRequest): Promise<Tenant> => {
    const response = await api.post('/admin/tenants', data);
    return response.data;
  },
  
  updateTenant: async (id: number, data: UpdateTenantRequest): Promise<Tenant> => {
    const response = await api.put(`/admin/tenants/${id}`, data);
    return response.data;
  },
  
  deleteTenant: async (id: number): Promise<void> => {
    await api.delete(`/admin/tenants/${id}`);
  },
  
  suspendTenant: async (id: number, reason?: string): Promise<Tenant> => {
    const response = await api.post(`/admin/tenants/${id}/suspend`, null, {
      params: { reason },
    });
    return response.data;
  },
  
  activateTenant: async (id: number): Promise<Tenant> => {
    const response = await api.post(`/admin/tenants/${id}/activate`);
    return response.data;
  },
  
  getTenantUsers: async (
    tenantId: number,
    params: {
      query?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<User>> => {
    const response = await api.get(`/admin/tenants/${tenantId}/users`, { params });
    return response.data;
  },
};
