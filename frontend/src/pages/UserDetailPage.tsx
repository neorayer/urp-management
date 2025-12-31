import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/userService';
import { User, Shield, Activity, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUserRequest, UserStatus } from '@/types';
import { useState } from 'react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewUser = id === 'new';

  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    password: '',
    displayName: '',
    phone: '',
    status: UserStatus.ACTIVE,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(Number(id)),
    enabled: !!id && !isNewUser,
  });

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate(`/users/${newUser.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!isNewUser && !user) {
    return <div className="text-center py-12">User not found</div>;
  }

  if (isNewUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Directory</p>
            <h1 className="text-3xl font-semibold">Create New User</h1>
            <p className="text-muted-foreground">Add a new user to the system.</p>
          </div>
        </div>

        <Card className="border border-border/70">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                  Cancel
                </Button>
              </div>

              {createUserMutation.isError && (
                <p className="text-sm text-destructive">
                  Error creating user. Please try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Directory</p>
        <h1 className="text-3xl font-semibold">User Details</h1>
        <p className="text-muted-foreground">View and manage user information.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="border border-border/70">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                    {user.displayName?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.displayName || 'N/A'}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {user.status}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-foreground gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Username: {user.username || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-foreground gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span>MFA: {user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center text-sm text-foreground gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <span>
                    Last Login:{' '}
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Roles & Permissions</CardTitle>
              </div>
              <Button size="sm">
                Assign Role
              </Button>
            </CardHeader>

            <CardContent>
              {user.roles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No roles assigned</p>
              ) : (
                <div className="space-y-4">
                  {user.roles.map((role) => (
                    <div key={role.id} className="rounded-lg border p-4 bg-muted/40">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-medium">{role.roleName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Scope: {role.scopeType}
                            {role.scopeId && ` (${role.scopeId})`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
                          Remove
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground space-x-2">
                        <span>Granted: {new Date(role.grantedAt).toLocaleDateString()}</span>
                        {role.expiresAt && (
                          <span>| Expires: {new Date(role.expiresAt).toLocaleDateString()}</span>
                        )}
                        {role.grantedByName && <span>| By: {role.grantedByName}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
