import api from '@/lib/api';
import { DashboardStats, RecentActivity } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await api.get<RecentActivity[]>('/admin/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  },
};
