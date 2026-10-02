import { Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface DialogFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  busyLabel?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

/**
 * Standard dialog form footer: Cancel + Submit button row.
 * Eliminates the identical "flex justify-end gap-2 / ghost Cancel / submit Button"
 * block duplicated across all admin CRUD dialogs.
 */
export function DialogFooter({
  onCancel,
  isSubmitting,
  submitLabel,
  busyLabel,
  disabled = false,
  variant = 'default',
}: DialogFooterProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting || disabled}>
        Cancel
      </Button>
      <Button type="submit" size="sm" variant={variant} disabled={isSubmitting || disabled}>
        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
        {isSubmitting && busyLabel ? busyLabel : submitLabel}
      </Button>
    </div>
  );
}
