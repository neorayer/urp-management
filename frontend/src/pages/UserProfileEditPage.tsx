import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, User as UserIcon, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateUserProfileRequest, UpdatePasswordRequest } from '@/types';

export default function UserProfileEditPage() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth } = useAuthStore();
  
  const [profileData, setProfileData] = useState<UpdateUserProfileRequest>({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState<UpdatePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      userApi.updateProfile(user!.id, data),
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, accessToken!);
      alert('Profile updated successfully!');
    },
    onError: () => {
      alert('Failed to update profile. Please try again.');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      userApi.updatePassword(user!.id, data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      alert('Password updated successfully!');
    },
    onError: () => {
      alert('Failed to update password. Please check your current password.');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    updatePasswordMutation.mutate(passwordData);
  };

  if (!user) {
    return <div className="text-center py-12">Please log in to edit your profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information and password.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="border border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, displayName: e.target.value })
                  }
                  placeholder="John Doe"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={profileData.avatar}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>

              {passwordData.newPassword && confirmPassword && passwordData.newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
