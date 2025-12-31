import api from '@/lib/api';
import {
  LoginRequest,
  AuthResponse,
  User,
  CreateUserRequest,
  AssignRoleRequest,
  UserRole,
  UserStatus,
  PageResponse,
} from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  logout: async (sessionId: string): Promise<void> => {
    await api.post('/auth/logout', null, { params: { sessionId } });
  },
};

export const userApi = {
  searchUsers: async (params: {
    query?: string;
    status?: UserStatus;
    tenantId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  
  updateUserStatus: async (id: number, status: UserStatus): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
  
  banUser: async (
    id: number,
    reason: string,
    expiresAt?: string
  ): Promise<User> => {
    const response = await api.post(`/admin/users/${id}/ban`, null, {
      params: { reason, expiresAt },
    });
    return response.data;
  },
  
  assignRole: async (
    userId: number,
    data: AssignRoleRequest
  ): Promise<UserRole> => {
    const response = await api.post(`/admin/users/${userId}/roles`, data);
    return response.data;
  },
  
  removeRole: async (userId: number, userRoleId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}/roles/${userRoleId}`);
  },
};
