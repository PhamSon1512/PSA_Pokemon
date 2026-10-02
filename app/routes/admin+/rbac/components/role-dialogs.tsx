import type { Role } from '../types';
import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { DialogFooter } from '~/components/admin/dialog-footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const CreateRoleSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, hyphens, underscores only'),
  name: z.string().min(1, 'Display name is required'),
  parentSlug: z.string(),
});

const EditRoleSchema = z.object({
  name: z.string().min(1, 'Display name is required'),
  description: z.string(),
  parentSlug: z.string(),
});

// ─── CreateRoleDialog ─────────────────────────────────────────────────────────

export function CreateRoleDialog({ open, roles, onClose }: { open: boolean; roles: Role[]; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  const form = useForm({
    validate: zodResolver(CreateRoleSchema),
    initialValues: { slug: '', name: '', parentSlug: '' },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const handleSubmit = form.onSubmit((values) =>
    run(
      () =>
        http.post('/api/admin/roles', {
          slug: values.slug,
          name: values.name,
          parentSlug: values.parentSlug || undefined,
        }),
      {
        successMessage: `Role "${values.name}" created successfully`,
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
          <DialogTitle>Create new role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-slug"
              placeholder="crm_agent"
              className="font-mono"
              aria-invalid={!!form.errors.slug}
              {...form.getInputProps('slug')}
            />
            {form.errors.slug ? (
              <p className="text-destructive text-xs">{form.errors.slug}</p>
            ) : (
              <p className="text-muted-foreground text-[11px]">Lowercase, alphanumeric, _ or -</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-name">
              Display name <span className="text-destructive">*</span>
            </Label>
            <Input id="role-name" placeholder="CRM Agent" aria-invalid={!!form.errors.name} {...form.getInputProps('name')} />
            {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-parent">Inherits from</Label>
            <Select value={form.values.parentSlug} onValueChange={(v) => form.setFieldValue('parentSlug', v)}>
              <SelectTrigger id="role-parent">
                <SelectValue placeholder="None (base role)" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={String(r.slug)} value={String(r.slug)}>
                    {String(r.name)} <span className="font-mono text-xs opacity-50">({String(r.slug)})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter onCancel={onClose} isSubmitting={isBusy} submitLabel="Create role" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── EditRoleDialog ───────────────────────────────────────────────────────────

export function EditRoleDialog({ role, roles, onClose }: { role: Role | null; roles: Role[]; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  const form = useForm({
    validate: zodResolver(EditRoleSchema),
    initialValues: {
      name: '',
      description: '',
      parentSlug: '__none__',
    },
  });

  // Sync form values when editing a different role
  useEffect(() => {
    if (role) {
      form.setValues({
        name: String(role.name ?? ''),
        description: String(role.description ?? ''),
        parentSlug: String(role.parentSlug ?? '__none__'),
      });
    }
  }, [role?.slug]);

  if (!role) return null;

  const handleSubmit = form.onSubmit((values) => {
    // '__none__' is the sentinel for "no parent" — translate to null
    const parentSlug = !values.parentSlug || values.parentSlug === '__none__' ? null : values.parentSlug;
    run(
      () =>
        http.patch(`/api/admin/roles/${String(role.slug)}`, {
          name: values.name,
          description: values.description || undefined,
          parentSlug,
        }),
      {
        successMessage: `Role "${values.name}" updated successfully`,
        onSuccess: onClose,
      },
    );
  });

  return (
    <Dialog open={!!role} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <code className="border-border bg-muted text-muted-foreground rounded-md border px-3 py-2 font-mono text-sm">
              {String(role.slug)}
            </code>
            <p className="text-muted-foreground text-[11px]">Slug cannot be changed after creation</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-role-name">
              Display name <span className="text-destructive">*</span>
            </Label>
            <Input id="edit-role-name" aria-invalid={!!form.errors.name} {...form.getInputProps('name')} />
            {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-role-desc">Description</Label>
            <Input id="edit-role-desc" placeholder="Brief description of this role..." {...form.getInputProps('description')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-role-parent">Inherits from</Label>
            <Select value={form.values.parentSlug} onValueChange={(v) => form.setFieldValue('parentSlug', v)}>
              <SelectTrigger id="edit-role-parent">
                <SelectValue placeholder="None (base role)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None (base role)</SelectItem>
                {roles
                  .filter((r) => String(r.slug) !== String(role.slug))
                  .map((r) => (
                    <SelectItem key={String(r.slug)} value={String(r.slug)}>
                      {String(r.name)} <span className="font-mono text-xs opacity-50">({String(r.slug)})</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter onCancel={onClose} isSubmitting={isBusy} submitLabel="Save changes" busyLabel="Saving…" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
