import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/userService';
import { roleApi } from '@/services/roleService';
import { User, Shield, Activity, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUserRequest, ScopeType, UpdateUserProfileRequest, UserStatus } from '@/types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewUser = id === 'new';
  
  console.log('UserDetailPage - id:', id, 'isNewUser:', isNewUser);

  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    password: '',
    displayName: '',
    phone: '',
    status: UserStatus.ACTIVE,
  });
  const [statusUpdate, setStatusUpdate] = useState<UserStatus>(UserStatus.ACTIVE);
  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [assignForm, setAssignForm] = useState<{
    roleId: number | '';
    scopeType: ScopeType;
    scopeId: string;
    expiresAt: string;
  }>({
    roleId: '',
    scopeType: ScopeType.GLOBAL,
    scopeId: '',
    expiresAt: '',
  });
  const [editProfileData, setEditProfileData] = useState<UpdateUserProfileRequest>({
    displayName: '',
    phone: '',
    avatar: '',
    locale: '',
    timezone: '',
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(Number(id)),
    enabled: !!id && !isNewUser,
  });
  
  const { data: availableRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAllRoles,
    enabled: !isNewUser,
  });

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate(`/users/${newUser.id}`);
    },
  });
  
  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNewUser) return;
    updateStatusMutation.mutate(statusUpdate);
  };
  
  const handleBanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNewUser) return;
    banUserMutation.mutate();
  };
  
  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNewUser || assignForm.roleId === '') return;
    assignRoleMutation.mutate();
  };
  
  const updateStatusMutation = useMutation({
    mutationFn: (status: UserStatus) => userApi.updateUserStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  const banUserMutation = useMutation({
    mutationFn: () => userApi.banUser(Number(id), banReason, banExpiresAt || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setBanReason('');
      setBanExpiresAt('');
    },
  });
  
  const assignRoleMutation = useMutation({
    mutationFn: () =>
      userApi.assignRole(Number(id), {
        roleId: Number(assignForm.roleId),
        scopeType: assignForm.scopeType,
        scopeId: assignForm.scopeId || undefined,
        expiresAt: assignForm.expiresAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setAssignForm({
        roleId: '',
        scopeType: ScopeType.GLOBAL,
        scopeId: '',
        expiresAt: '',
      });
    },
  });
  
  const removeRoleMutation = useMutation({
    mutationFn: (userRoleId: number) => userApi.removeRole(Number(id), userRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => 
      userApi.updateProfile(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const adminResetPasswordMutation = useMutation({
    mutationFn: (data: { newPassword: string }) => 
      userApi.adminResetPassword(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordReset(false);
    },
  });
  
  useEffect(() => {
    if (user) {
      setStatusUpdate(user.status);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditProfileData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        locale: user.locale || '',
        timezone: user.timezone || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNewUser) return;
    updateProfileMutation.mutate(editProfileData);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNewUser) return;
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (resetPasswordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    if (window.confirm('Are you sure you want to reset this user\'s password? This action cannot be undone.')) {
      adminResetPasswordMutation.mutate({ newPassword: resetPasswordData.newPassword });
    }
  };

  // Check for new user first before loading states
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

  // Loading and error states for existing user
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
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

        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="statusSelect">Status</Label>
                    <Select
                      value={statusUpdate}
                      onValueChange={(value) => setStatusUpdate(value as UserStatus)}
                    >
                      <SelectTrigger id="statusSelect">
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
                  <Button type="submit" disabled={updateStatusMutation.isPending}>
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
                {updateStatusMutation.isError && (
                  <p className="text-sm text-destructive">Failed to update status.</p>
                )}
              </form>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ban User</p>
                    <p className="text-xs text-muted-foreground">
                      Add a ban reason and optional expiry.
                    </p>
                  </div>
                  {user.status === UserStatus.BANNED && (
                    <Badge variant="destructive" className="uppercase">
                      Banned
                    </Badge>
                  )}
                </div>
                <form onSubmit={handleBanSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="banReason">Reason</Label>
                      <Input
                        id="banReason"
                        required
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Violation of policy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banExpires">Expires At (optional)</Label>
                      <Input
                        id="banExpires"
                        type="datetime-local"
                        value={banExpiresAt}
                        onChange={(e) => setBanExpiresAt(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={banUserMutation.isPending}
                    >
                      {banUserMutation.isPending ? 'Applying ban...' : 'Ban User'}
                    </Button>
                    {user.status === UserStatus.BANNED && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => updateStatusMutation.mutate(UserStatus.ACTIVE)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Unban & Activate
                      </Button>
                    )}
                  </div>
                  {banUserMutation.isError && (
                    <p className="text-sm text-destructive">Failed to ban user.</p>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Edit Profile (Admin)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editDisplayName">Display Name</Label>
                    <Input
                      id="editDisplayName"
                      value={editProfileData.displayName || ''}
                      onChange={(e) => setEditProfileData({ ...editProfileData, displayName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      type="tel"
                      value={editProfileData.phone || ''}
                      onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editAvatar">Avatar URL</Label>
                  <Input
                    id="editAvatar"
                    value={editProfileData.avatar || ''}
                    onChange={(e) => setEditProfileData({ ...editProfileData, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editLocale">Locale</Label>
                    <Input
                      id="editLocale"
                      value={editProfileData.locale || ''}
                      onChange={(e) => setEditProfileData({ ...editProfileData, locale: e.target.value })}
                      placeholder="en-US"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editTimezone">Timezone</Label>
                    <Input
                      id="editTimezone"
                      value={editProfileData.timezone || ''}
                      onChange={(e) => setEditProfileData({ ...editProfileData, timezone: e.target.value })}
                      placeholder="America/New_York"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
                
                {updateProfileMutation.isSuccess && (
                  <p className="text-sm text-green-600">Profile updated successfully!</p>
                )}
                {updateProfileMutation.isError && (
                  <p className="text-sm text-destructive">Failed to update profile.</p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Reset Password (Admin)</CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordReset ? (
                <Button onClick={() => setShowPasswordReset(true)} variant="outline">
                  Show Password Reset Form
                </Button>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-800">
                      ⚠️ This will reset the user's password without requiring their current password. 
                      The user will be able to log in with the new password immediately.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      required
                      minLength={8}
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={adminResetPasswordMutation.isPending}
                    >
                      {adminResetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowPasswordReset(false);
                        setResetPasswordData({ newPassword: '', confirmPassword: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {adminResetPasswordMutation.isSuccess && (
                    <p className="text-sm text-green-600">Password reset successfully!</p>
                  )}
                  {adminResetPasswordMutation.isError && (
                    <p className="text-sm text-destructive">Failed to reset password.</p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Roles & Permissions</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form
                onSubmit={handleAssignRole}
                className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="roleSelect">Role</Label>
                    <Select
                      value={assignForm.roleId === '' ? '' : String(assignForm.roleId)}
                      onValueChange={(value) =>
                        setAssignForm((prev) => ({ ...prev, roleId: Number(value) }))
                      }
                    >
                      <SelectTrigger id="roleSelect">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(availableRoles || []).map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scopeType">Scope Type</Label>
                    <Select
                      value={assignForm.scopeType}
                      onValueChange={(value) =>
                        setAssignForm((prev) => ({
                          ...prev,
                          scopeType: value as ScopeType,
                        }))
                      }
                    >
                      <SelectTrigger id="scopeType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ScopeType).map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scopeId">Scope ID (optional)</Label>
                    <Input
                      id="scopeId"
                      value={assignForm.scopeId}
                      onChange={(e) =>
                        setAssignForm((prev) => ({ ...prev, scopeId: e.target.value }))
                      }
                      placeholder="tenant_123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleExpires">Expires At (optional)</Label>
                    <Input
                      id="roleExpires"
                      type="datetime-local"
                      value={assignForm.expiresAt}
                      onChange={(e) =>
                        setAssignForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={assignForm.roleId === '' || assignRoleMutation.isPending}
                  >
                    {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                  </Button>
                  {assignRoleMutation.isError && (
                    <p className="text-sm text-destructive">Unable to assign role.</p>
                  )}
                </div>
              </form>

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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => removeRoleMutation.mutate(role.id)}
                          disabled={removeRoleMutation.isPending}
                        >
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
