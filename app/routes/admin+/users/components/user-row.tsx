import type { UserItem } from '../types';
import type { UserRole } from '~/lib/constants';
import { Pencil, Shield, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { DEFAULT_ROLE_STYLE, getDisplayName, ROLE_STYLES } from '../helpers';

export function UserRow({ user: u, onEdit, onDelete }: { user: UserItem; onEdit: () => void; onDelete: () => void }) {
  const roleStyle = ROLE_STYLES[u.role as UserRole] ?? DEFAULT_ROLE_STYLE;

  return (
    <tr className="group hover:bg-muted/20 transition-colors">
      {/* Avatar + name + email */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-[11px] font-bold text-white">
            {u.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-card-foreground truncate text-sm font-medium">{getDisplayName(u)}</p>
            <p className="text-muted-foreground truncate text-xs">{u.email}</p>
          </div>
        </div>
      </td>

      {/* Role badge */}
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
            roleStyle,
          )}
        >
          {u.role === 'admin' && <Shield className="size-2.5" />}
          {u.role ?? 'user'}
        </span>
      </td>

      {/* Joined date — hidden on mobile */}
      <td className="text-muted-foreground hidden px-4 py-3 text-xs sm:table-cell">
        {u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}>
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit user</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive size-7"
                onClick={onDelete}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete user</TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
