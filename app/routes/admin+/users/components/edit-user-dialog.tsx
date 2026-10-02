import type { RoleItem, UserItem } from '../types';
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

const EditUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  role: z.string().min(1, 'Role is required'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export function EditUserDialog({ user, roles, onClose }: { user: UserItem | null; roles: RoleItem[]; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  const form = useForm({
    validate: zodResolver(EditUserSchema),
    initialValues: {
      firstName: '',
      lastName: '',
      role: '',
    },
  });

  // Sync form values when a different user is selected
  useEffect(() => {
    if (user) {
      form.setValues({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        role: user.role ?? roles.find((r) => r.slug === 'user')?.slug ?? '',
      });
    }
  }, [user?.id]);

  const handleSubmit = form.onSubmit((values) => {
    if (!user) return;
    run(
      () =>
        http.patch(`/api/users/${user.id}`, {
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          role: values.role,
        }),
      {
        successMessage: `User "${user.email}" updated successfully`,
        onSuccess: onClose,
      },
    );
  });

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription className="truncate text-xs">{user?.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-first">First name</Label>
              <Input id="edit-first" {...form.getInputProps('firstName')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-last">Last name</Label>
              <Input id="edit-last" {...form.getInputProps('lastName')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-role">
              Role <span className="text-destructive">*</span>
            </Label>
            <RoleSelect
              id="edit-role"
              name="role"
              value={form.values.role}
              roles={roles}
              onChange={(value) => form.setFieldValue('role', value)}
            />
            {form.errors.role && <p className="text-destructive text-xs">{form.errors.role}</p>}
            <p className="text-muted-foreground text-[11px]">Only admins can change roles</p>
          </div>

          <DialogFooter onCancel={onClose} isSubmitting={isBusy} submitLabel="Save changes" busyLabel="Saving…" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
