import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { tenantApi } from '@/services/tenantService';
import { CreateTenantRequest, UpdateTenantRequest, Tenant, TenantStatus } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant;
  onSuccess?: () => void;
}

export default function TenantFormDialog({ open, onOpenChange, tenant, onSuccess }: TenantFormDialogProps) {
  const isEdit = !!tenant;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTenantRequest | UpdateTenantRequest>({
    defaultValues: tenant
      ? {
          name: tenant.name,
          domain: tenant.domain || '',
          status: tenant.status,
        }
      : {
          name: '',
          slug: '',
          domain: '',
          status: TenantStatus.ACTIVE,
        },
  });

  const status = watch('status');

  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        domain: tenant.domain || '',
        status: tenant.status,
      });
    } else {
      reset({
        name: '',
        slug: '',
        domain: '',
        status: TenantStatus.ACTIVE,
      });
    }
  }, [tenant, reset]);

  const createMutation = useMutation({
    mutationFn: tenantApi.createTenant,
    onSuccess: () => {
      if (onSuccess) onSuccess();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTenantRequest }) =>
      tenantApi.updateTenant(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
      reset();
    },
  });

  const onSubmit = (data: CreateTenantRequest | UpdateTenantRequest) => {
    if (isEdit && tenant) {
      updateMutation.mutate({
        id: tenant.id,
        data: data as UpdateTenantRequest,
      });
    } else {
      createMutation.mutate(data as CreateTenantRequest);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    
    // Auto-generate slug only for new tenants
    if (!isEdit) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      setValue('slug', slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tenant' : 'Create New Tenant'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Tenant name is required' })}
                onChange={handleNameChange}
                placeholder="Enter tenant name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
                    },
                  })}
                  placeholder="tenant-slug"
                />
                {errors.slug && 'message' in errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Auto-generated from name, but you can customize it
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                {...register('domain', {
                  pattern: {
                    value: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Invalid domain format',
                  },
                })}
                placeholder="example.com"
              />
              {errors.domain && 'message' in errors.domain && (
                <p className="text-sm text-red-500">{errors.domain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as TenantStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TenantStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                ? 'Update Tenant'
                : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
