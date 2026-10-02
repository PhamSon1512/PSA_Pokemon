import type { Permission } from '../types';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { http } from '~/lib/http';
import { cn } from '~/lib/utils';
import { METHOD_COLORS } from '../helpers';

export function PermissionRow({ permission }: { permission: Permission }) {
  const revalidator = useRevalidator();
  const [isDeleting, setIsDeleting] = useState(false);

  // Render base path in normal color, :param segment muted
  const [base, ...rest] = permission.resource.split('/:');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await http.delete(`/api/admin/permissions/${permission.id}`);
      revalidator.revalidate();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs">
        <span className="text-foreground">{base}</span>
        {rest.length > 0 && <span className="text-muted-foreground">{`/:${rest.join('/:')}`}</span>}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold',
            METHOD_COLORS[permission.action] ?? 'bg-muted text-muted-foreground',
          )}
        >
          {permission.action}
        </span>
      </td>
      <td className="text-muted-foreground px-4 py-3 text-xs">{permission.description ?? '—'}</td>
      <td className="px-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive invisible size-7 group-hover:visible"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete permission</TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}
