import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';

interface DeleteBatchDialogProps {
  /** IDs to delete. Dialog is open when this array is non-empty. */
  ids: string[];
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteBatchDialog({ ids, onClose, onDeleted }: DeleteBatchDialogProps) {
  const { isBusy, run } = useAsyncAction();

  const handleDelete = () =>
    run(() => http.post('/api/media/batch-delete', { ids }), {
      successMessage: `${ids.length} file${ids.length !== 1 ? 's' : ''} deleted`,
      onSuccess: onDeleted,
    });

  return (
    <AlertDialog open={ids.length > 0} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {ids.length} file{ids.length !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className="text-foreground font-medium">
              {ids.length} file{ids.length !== 1 ? 's' : ''}
            </span>{' '}
            from storage. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isBusy}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={isBusy}
            onClick={handleDelete}
            className="gap-1.5 bg-[#ef4444] text-white hover:bg-[#dc2626]"
          >
            {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {isBusy ? 'Deleting…' : `Delete ${ids.length} file${ids.length !== 1 ? 's' : ''}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
