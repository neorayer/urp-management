import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '@/services/tenantService';
import { Building2, Users, Calendar, ArrowLeft, Edit, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TenantStatus } from '@/types';
import { cn } from '@/lib/utils';
import TenantFormDialog from '@/components/TenantFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [usersPage, setUsersPage] = useState(0);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantApi.getTenantById(Number(id)),
    enabled: !!id,
  });

  const { data: usersData } = useQuery({
    queryKey: ['tenant-users', id, usersPage],
    queryFn: () => tenantApi.getTenantUsers(Number(id), { page: usersPage, size: 10 }),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => tenantApi.deleteTenant(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate('/tenants');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => tenantApi.suspendTenant(Number(id), reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => tenantApi.activateTenant(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleSuspend = () => {
    const reason = prompt('Enter reason for suspension:');
    if (reason) {
      suspendMutation.mutate(reason);
    }
  };

  const getStatusBadge = (status: TenantStatus) => {
    const colors: Record<TenantStatus, string> = {
      [TenantStatus.ACTIVE]: 'bg-green-100 text-green-700',
      [TenantStatus.INACTIVE]: 'bg-muted text-muted-foreground',
      [TenantStatus.SUSPENDED]: 'bg-amber-100 text-amber-700',
      [TenantStatus.TRIAL]: 'bg-blue-100 text-blue-700',
    };

    return (
      <Badge variant="outline" className={cn('capitalize border-0', colors[status])}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading tenant details...</div>;
  }

  if (!tenant) {
    return <div className="text-center py-12">Tenant not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">Management</p>
          <h1 className="text-3xl font-semibold">{tenant.name}</h1>
          <p className="text-muted-foreground">Tenant details and management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="border border-border/70">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-12 w-12" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{tenant.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">{tenant.slug}</code>
                  </p>
                </div>
                {getStatusBadge(tenant.status)}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-foreground gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span>Domain: {tenant.domain || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-foreground gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{tenant.userCount} user(s)</span>
                </div>
                <div className="flex items-center text-sm text-foreground gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {tenant.suspendedAt && (
                  <div className="flex items-center text-sm text-foreground gap-2">
                    <PauseCircle className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Suspended: {new Date(tenant.suspendedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {tenant.trialEndsAt && (
                  <div className="flex items-center text-sm text-foreground gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Trial Ends: {new Date(tenant.trialEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tenant Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {tenant.status === TenantStatus.SUSPENDED ? (
                  <Button
                    onClick={() => activateMutation.mutate()}
                    disabled={activateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {activateMutation.isPending ? 'Activating...' : 'Activate Tenant'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleSuspend}
                    disabled={suspendMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <PauseCircle className="h-4 w-4" />
                    {suspendMutation.isPending ? 'Suspending...' : 'Suspend Tenant'}
                  </Button>
                )}
              </div>

              {(suspendMutation.isError || activateMutation.isError) && (
                <p className="text-sm text-red-500">
                  Failed to update tenant status. Please try again.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tenant Users</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/users?tenantId=${tenant.id}">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!usersData || usersData.content.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users found</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.content.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.displayName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/users/${user.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {usersData && !usersData.last && (
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setUsersPage(usersPage + 1)}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TenantFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tenant={tenant}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant', id] });
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
}
