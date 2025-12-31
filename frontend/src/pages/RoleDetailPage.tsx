import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roleApi, permissionApi } from '@/services/roleService';
import { Shield, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: role, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleApi.getRoleById(Number(id)),
    enabled: !!id,
  });

  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionApi.getAllPermissions,
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!role) {
    return <div className="text-center py-12">Role not found</div>;
  }

  const permissionsByCategory = allPermissions?.reduce((acc, perm) => {
    const cat = perm.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{role.name}</h1>
            <p className="text-muted-foreground">{role.description || 'No description'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={role.isSystem ? 'secondary' : 'outline'}>
                  {role.isSystem ? 'System Role' : 'Custom Role'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="text-sm font-medium">
                  {role.permissions.length} assigned
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!role.isSystem && (
                <div className="pt-2 space-y-2">
                  <Button className="w-full">
                    Edit Role
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Role
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(permissionsByCategory || {}).map(([category, perms]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">{category}</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {perms.map((perm) => {
                      const isAssigned = role.permissions.some(p => p.id === perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${isAssigned ? 'bg-primary/5 border-primary/30' : 'bg-muted/40'}`}
                        >
                          <div className="flex items-center gap-2">
                            {isAssigned && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{perm.key}</p>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
