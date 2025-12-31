import api from '@/lib/api';
import { AuditLog, PageResponse } from '@/types';

export const auditApi = {
  searchAuditLogs: async (params: {
    actorUserId?: number;
    action?: string;
    targetType?: string;
    targetId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AuditLog>> => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
