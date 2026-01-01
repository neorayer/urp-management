import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleApi, permissionApi } from '@/services/roleService';
import { CreateRoleRequest, UpdateRoleRequest, Role } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role;
}

export default function RoleFormDialog({ open, onClose, role }: RoleFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!role;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleRequest | UpdateRoleRequest>({
    defaultValues: role
      ? {
          name: role.name,
          description: role.description || '',
          permissionIds: role.permissions.map((p) => p.id),
        }
      : {
          name: '',
          description: '',
          permissionIds: [],
        },
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role?.permissions.map((p) => p.id) || []
  );

  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionApi.getAllPermissions,
  });

  const createMutation = useMutation({
    mutationFn: roleApi.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) =>
      roleApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', role?.id] });
      onClose();
      reset();
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map((p) => p.id),
      });
      setSelectedPermissions(role.permissions.map((p) => p.id));
    } else {
      reset({
        name: '',
        description: '',
        permissionIds: [],
      });
      setSelectedPermissions([]);
    }
  }, [role, reset]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const onSubmit = (data: CreateRoleRequest | UpdateRoleRequest) => {
    const formData = {
      ...data,
      permissionIds: selectedPermissions,
    };

    if (isEdit && role) {
      updateMutation.mutate({
        id: role.id,
        data: formData as UpdateRoleRequest,
      });
    } else {
      createMutation.mutate(formData as CreateRoleRequest);
    }
  };

  const permissionsByCategory = allPermissions?.reduce((acc, perm) => {
    const cat = perm.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Role name is required' })}
                placeholder="Enter role name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Enter role description"
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                {Object.entries(permissionsByCategory || {}).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">{category}</h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {perms.map((perm) => {
                        const isSelected = selectedPermissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-muted/40 hover:bg-muted/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{perm.key}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {perm.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                ? 'Update Role'
                : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
