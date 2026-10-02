import type { Permission } from '../types';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '~/lib/http';
import { cn } from '~/lib/utils';
import { METHOD_COLORS } from '../helpers';

// Each PermissionToggle is independent — prevents one in-flight call from blocking siblings.
export function PermissionToggle({
  roleSlug,
  permission,
  active,
  disabled,
  inherited = false,
}: {
  roleSlug: string;
  permission: Permission;
  active: boolean;
  disabled: boolean;
  // inherited: permission comes from a parent role — show as checked + read-only
  inherited?: boolean;
}) {
  const revalidator = useRevalidator();
  const [isPending, setIsPending] = useState(false);
  // Optimistic UI: flip visual state immediately
  const optimisticActive = isPending ? !active : active;

  const handleToggle = async () => {
    setIsPending(true);
    try {
      if (active) {
        // Revoke: DELETE /api/admin/roles/:slug/permissions/:permissionId
        await http.delete(`/api/admin/roles/${roleSlug}/permissions/${permission.id}`);
      } else {
        // Assign: POST /api/admin/roles/:slug/permissions
        await http.post(`/api/admin/roles/${roleSlug}/permissions`, { permissionId: permission.id });
      }
      revalidator.revalidate();
    } catch (err) {
      toast.error(active ? 'Failed to revoke permission' : 'Failed to assign permission');
    } finally {
      setIsPending(false);
    }
  };

  // Inherited permissions are always shown as "active" but cannot be toggled
  if (inherited) {
    return (
      <div
        title="Inherited from parent role — cannot be revoked here"
        className="flex w-full cursor-default items-center gap-2 rounded-lg border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] px-3 py-2 text-xs opacity-70"
      >
        {/* Checked indicator — muted indigo */}
        <span className="flex size-4 shrink-0 items-center justify-center rounded bg-[rgba(99,102,241,0.3)] text-[#6366f1]">
          <Check className="size-2.5" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span
            className={cn(
              'inline-block rounded px-1 py-0.5 font-mono text-[10px] font-bold',
              METHOD_COLORS[permission.action] ?? 'bg-muted text-muted-foreground',
            )}
          >
            {permission.action}
          </span>
          <span className="text-foreground/80 mt-0.5 block truncate text-[10px]">{permission.resource}</span>
        </span>
        {/* Lock icon indicates read-only */}
        <Lock className="text-muted-foreground/50 size-3 shrink-0" />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={handleToggle}
      title={
        disabled
          ? 'Admin has wildcard — no explicit assignment needed'
          : optimisticActive
            ? `Revoke: ${permission.action} ${permission.resource}`
            : `Assign: ${permission.action} ${permission.resource}`
      }
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
        optimisticActive
          ? 'text-foreground border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.08)]'
          : 'border-border bg-card text-muted-foreground hover:bg-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded transition-colors',
          optimisticActive ? 'bg-[#6366f1] text-white' : 'bg-muted',
        )}
      >
        {optimisticActive && <Check className="size-2.5" />}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span
          className={cn(
            'inline-block rounded px-1 py-0.5 font-mono text-[10px] font-bold',
            METHOD_COLORS[permission.action] ?? 'bg-muted text-muted-foreground',
          )}
        >
          {permission.action}
        </span>
        <span className="text-foreground/80 mt-0.5 block truncate text-[10px]">{permission.resource}</span>
      </span>
      {isPending && <Loader2 className="size-3 shrink-0 animate-spin opacity-50" />}
    </button>
  );
}
