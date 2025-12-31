import { useAuthStore } from '@/store/authStore';
import { Users, Shield, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats, RecentActivity } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const statsConfig = [
    { 
      name: 'Total Users', 
      value: stats?.totalUsers ?? 0, 
      icon: Users, 
      color: 'bg-primary/10 text-primary' 
    },
    { 
      name: 'Active Roles', 
      value: stats?.activeRoles ?? 0, 
      icon: Shield, 
      color: 'bg-green-100 text-green-700' 
    },
    { 
      name: 'Audit Logs', 
      value: stats?.totalAuditLogs ?? 0, 
      icon: FileText, 
      color: 'bg-indigo-100 text-indigo-700' 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-semibold">
          Welcome back, {user?.displayName || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening across your environment today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="border border-border/60">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-semibold">{stat.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center text-sm">
                  <Badge variant="muted" className="mr-3 h-2 w-2 rounded-full px-0" />
                  <span className="text-foreground">{activity.description}</span>
                  <span className="ml-auto text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" onClick={() => navigate('/users')}>
              View Users
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/roles')}>
              View Roles
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/audit-logs')}>
              View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
