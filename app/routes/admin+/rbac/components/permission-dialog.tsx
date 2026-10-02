import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { DialogFooter } from '~/components/admin/dialog-footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useAsyncAction } from '~/hooks/use-async-action';
import { HTTP_METHODS } from '~/lib/constants';
import { http } from '~/lib/http';

// ─── Zod schema ───────────────────────────────────────────────────────────────

const CreatePermissionSchema = z.object({
  resource: z.string().min(1, 'Resource path is required'),
  action: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', '*'], {
    errorMap: () => ({ message: 'HTTP method is required' }),
  }),
  description: z.string().optional(),
});

type CreatePermissionValues = z.infer<typeof CreatePermissionSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatePermissionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  const form = useForm<CreatePermissionValues>({
    validate: zodResolver(CreatePermissionSchema),
    initialValues: { resource: '', action: 'GET', description: '' },
  });

  // Reset + close
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit((values) =>
    run(
      () =>
        http.post('/api/admin/permissions', {
          resource: values.resource,
          action: values.action,
          description: values.description || undefined,
        }),
      {
        successMessage: 'Permission created successfully',
        onSuccess: () => {
          form.reset();
          onClose();
        },
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new permission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="perm-resource">
              Resource path <span className="text-destructive">*</span>
            </Label>
            <Input
              id="perm-resource"
              placeholder="/api/contacts/:id"
              className="font-mono"
              aria-invalid={!!form.errors.resource}
              {...form.getInputProps('resource')}
            />
            {form.errors.resource ? (
              <p className="text-destructive text-xs">{form.errors.resource}</p>
            ) : (
              <p className="text-muted-foreground text-[11px]">Use :param for dynamic segments</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="perm-action">
              HTTP method <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.values.action}
              onValueChange={(v) => form.setFieldValue('action', v as CreatePermissionValues['action'])}
            >
              <SelectTrigger id="perm-action" aria-invalid={!!form.errors.action}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="font-mono">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.action && <p className="text-destructive text-xs">{form.errors.action}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="perm-desc">Description</Label>
            <Input id="perm-desc" placeholder="Read a single contact" {...form.getInputProps('description')} />
          </div>

          <DialogFooter onCancel={handleClose} isSubmitting={isBusy} submitLabel="Create" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
