import type { RoleItem } from '../types';
import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { DialogFooter } from '~/components/admin/dialog-footer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';
import { RoleSelect } from './role-select';

// ─── Zod schema ───────────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateUserDialog({ open, roles, onClose }: { open: boolean; roles: RoleItem[]; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  // Prefer 'user' as default; fall back to first available role
  const defaultRole = roles.find((r) => r.slug === 'user')?.slug ?? roles[0]?.slug ?? '';

  const form = useForm({
    validate: zodResolver(CreateUserSchema),
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: defaultRole,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const handleSubmit = form.onSubmit((values) =>
    run(
      () =>
        http.post('/api/auth/register', {
          email: values.email,
          password: values.password,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
        }),
      {
        successMessage: `User "${values.email}" created successfully`,
        onSuccess: () => {
          form.reset();
          onClose();
        },
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new user</DialogTitle>
          <DialogDescription>Admin-created accounts do not send an invite email.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-email"
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!form.errors.email}
              {...form.getInputProps('email')}
            />
            {form.errors.email && <p className="text-destructive text-xs">{form.errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-password"
              type="password"
              placeholder="Min. 8 characters"
              aria-invalid={!!form.errors.password}
              {...form.getInputProps('password')}
            />
            {form.errors.password && <p className="text-destructive text-xs">{form.errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-first">First name</Label>
              <Input id="create-first" placeholder="Jane" {...form.getInputProps('firstName')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-last">Last name</Label>
              <Input id="create-last" placeholder="Doe" {...form.getInputProps('lastName')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-role">
              Role <span className="text-destructive">*</span>
            </Label>
            <RoleSelect
              id="create-role"
              name="role"
              value={form.values.role}
              roles={roles}
              onChange={(value) => form.setFieldValue('role', value)}
            />
            {form.errors.role && <p className="text-destructive text-xs">{form.errors.role}</p>}
          </div>

          <DialogFooter onCancel={onClose} isSubmitting={isBusy} submitLabel="Create user" busyLabel="Creating…" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
