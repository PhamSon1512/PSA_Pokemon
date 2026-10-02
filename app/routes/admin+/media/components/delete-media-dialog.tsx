import type { MediaItem } from '../types';
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

interface DeleteMediaDialogProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function DeleteMediaDialog({ item, onClose }: DeleteMediaDialogProps) {
  const { isBusy, run } = useAsyncAction();

  const handleDelete = () =>
    run(() => http.delete(`/api/media/${item!.id}`), {
      successMessage: 'File deleted',
      onSuccess: onClose,
    });

  return (
    <AlertDialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete file</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{' '}
            <span className="text-foreground font-medium">{item?.title ?? item?.fileName}</span>? This will remove the file from
            storage and cannot be undone.
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
            {isBusy ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
