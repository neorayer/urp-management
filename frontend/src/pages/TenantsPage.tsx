import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tenantApi } from '@/services/tenantService';
import { TenantStatus } from '@/types';
import { Search, Plus, Filter, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import TenantFormDialog from '@/components/TenantFormDialog';

export default function TenantsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TenantStatus | undefined>();
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', query, status, page],
    queryFn: () => tenantApi.searchTenants({ query, status, page, size: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tenantApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const getStatusBadge = (status: TenantStatus) => {
    const colors: Record<TenantStatus, string> = {
      [TenantStatus.ACTIVE]: 'bg-green-100 text-green-700',
      [TenantStatus.INACTIVE]: 'bg-muted text-muted-foreground',
      [TenantStatus.SUSPENDED]: 'bg-amber-100 text-amber-700',
      [TenantStatus.TRIAL]: 'bg-blue-100 text-blue-700',
    };

    return (
      <Badge
        variant="outline"
        className={cn('capitalize border-0', colors[status])}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Management</p>
          <h1 className="text-3xl font-semibold">Tenants</h1>
          <p className="text-muted-foreground">Manage tenant organizations and settings.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Tenant
        </Button>
      </div>

      <Card className="border border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-muted-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tenants..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={status || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? undefined : (value as TenantStatus))}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(TenantStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="secondary" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="text-center border border-border/70 py-12">
          <p className="text-muted-foreground">Loading tenants...</p>
        </Card>
      ) : (
        <>
          <Card className="border border-border/70">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.content.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {tenant.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{tenant.slug}</code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tenant.domain || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {tenant.userCount} user(s)
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <Button variant="ghost" className="h-auto px-0 text-primary" asChild>
                          <Link to={`/tenants/${tenant.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {data && !data.last && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                className="mt-4"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      <TenantFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
