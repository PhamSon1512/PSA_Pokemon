import type { UserItem } from '../types';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';

export function DeleteUserDialog({ user, onClose }: { user: UserItem | null; onClose: () => void }) {
  const { isBusy, run } = useAsyncAction();

  const handleDelete = () =>
    run(() => http.delete(`/api/users/${user!.id}`), {
      successMessage: `User "${user?.email ?? ''}" deleted successfully`,
      onSuccess: onClose,
    });

  return (
    <Dialog
      open={!!user}
      onOpenChange={(v) => {
        if (!v && !isBusy) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
          <DialogDescription>
            This will soft-delete <span className="text-foreground font-medium">{user?.email ?? ''}</span>. They will be logged out
            and can no longer access the system.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isBusy || !user}>
            Cancel
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={isBusy || !user} onClick={handleDelete}>
            {isBusy ? 'Deleting…' : 'Delete user'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
