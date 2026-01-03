export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum ScopeType {
  GLOBAL = 'GLOBAL',
  TENANT = 'TENANT',
  PROJECT = 'PROJECT',
  RESOURCE = 'RESOURCE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: number;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  tenantId?: number;
  tenantName?: string;
  roles: UserRole[];
}

export interface UserRole {
  id: number;
  roleId: number;
  roleName: string;
  scopeType: ScopeType;
  scopeId?: string;
  grantedAt: string;
  expiresAt?: string;
  grantedByName?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  tenantId?: number;
  permissions: Permission[];
  usageCount?: number;
}

export interface Permission {
  id: number;
  key: string;
  description?: string;
  category?: string;
  resource?: string;
  action?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  targetType?: string;
  targetId?: string;
  diffJson?: string;
  createdAt: string;
  actorUserId?: number;
  actorUserEmail?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface CreateUserRequest {
  email: string;
  username?: string;
  password: string;
  displayName?: string;
  phone?: string;
  tenantId?: number;
  status?: UserStatus;
  locale?: string;
  timezone?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeRoles: number;
  totalAuditLogs: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  actorEmail: string;
}

export interface AssignRoleRequest {
  roleId: number;
  scopeType: ScopeType;
  scopeId?: string;
  expiresAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  tenantId?: number;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  phone?: string;
  avatar?: string;
  locale?: string;
  timezone?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  status: TenantStatus;
  createdAt: string;
  suspendedAt?: string;
  trialEndsAt?: string;
  userCount: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  domain?: string;
  status?: TenantStatus;
  settings?: string;
  trialEndsAt?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  status?: TenantStatus;
  settings?: string;
  trialEndsAt?: string;
}
