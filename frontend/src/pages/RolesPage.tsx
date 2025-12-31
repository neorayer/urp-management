import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roleApi } from '@/services/roleService';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAllRoles,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Permissions</p>
          <h1 className="text-3xl font-semibold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage roles and their permission sets.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Role
        </Button>
      </div>

      {isLoading ? (
        <Card className="text-center py-12 border border-border/70">
          <p className="text-muted-foreground">Loading roles...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles?.map((role) => (
            <Link key={role.id} to={`/roles/${role.id}`}>
              <Card className="h-full border border-border/70 transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary" className="mt-1">
                          System
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {role.permissions.length} permissions
                    </span>
                    <span className="text-primary hover:underline">
                      View details →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
