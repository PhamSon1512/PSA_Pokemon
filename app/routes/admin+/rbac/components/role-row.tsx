import type { Permission, Role } from '../types';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Check, ChevronDown, ChevronRight, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { http } from '~/lib/http';
import { groupByBasePath } from '../helpers';
import { PermissionToggle } from './permission-toggle';

export function RoleRow({
  role,
  allPermissions,
  assigned,
  inheritedIds,
  expanded,
  onToggle,
  onEdit,
}: {
  role: Role;
  allPermissions: Permission[];
  assigned: Permission[];
  // IDs of permissions inherited from ancestor roles (read-only in UI)
  inheritedIds: Set<string>;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const revalidator = useRevalidator();
  const [isDeleting, setIsDeleting] = useState(false);
  const assignedIds = new Set(assigned.map((p) => p.id));

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await http.delete(`/api/admin/roles/${role.slug}`);
      revalidator.revalidate();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Collapsible open={expanded} onOpenChange={onToggle} className="border-border bg-card overflow-hidden rounded-xl border">
      {/* Role header row */}
      <div className="flex items-center gap-3 px-4 py-4">
        <CollapsibleTrigger asChild>
          <button className="group flex flex-1 items-center gap-3 text-left">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <KeyRound className="size-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-card-foreground text-sm font-medium">{role.name}</span>
                <code className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">{role.slug}</code>
                {role.parentSlug && (
                  <span className="text-muted-foreground text-[10px]">
                    extends <code className="font-mono">{role.parentSlug}</code>
                  </span>
                )}
              </div>
              {role.description && <p className="text-muted-foreground mt-0.5 truncate text-xs">{role.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {assigned.length} permissions
              </Badge>
              {expanded ? (
                <ChevronDown className="text-muted-foreground size-4" />
              ) : (
                <ChevronRight className="text-muted-foreground size-4" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Edit + Delete role */}
        <div className="ml-1 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit role</TooltipContent>
          </Tooltip>

          {role.slug !== 'admin' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive/10 hover:text-destructive size-7"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete role</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Expanded: permission assignment — grouped by base path */}
      <CollapsibleContent>
        <Separator />
        <div className="bg-muted/20 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Direct permissions
              <span className="ml-2 font-normal normal-case">— click to assign or revoke</span>
            </p>
            <span className="text-muted-foreground text-[11px]">
              {assigned.length}/{allPermissions.length} assigned
              {inheritedIds.size > 0 && (
                <span className="ml-1.5 text-[10px] text-[#6366f1]/70">+{inheritedIds.size} inherited</span>
              )}
            </span>
          </div>

          {role.slug === 'admin' && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.06)] px-3 py-2">
              <Check className="size-3.5 shrink-0 text-[#6366f1]" />
              <p className="text-xs text-[#6366f1]">
                Admin has <strong>wildcard (*)</strong> grant — can access everything without explicit assignment.
              </p>
            </div>
          )}

          {allPermissions.length === 0 ? (
            <p className="text-muted-foreground text-xs">No permissions defined yet. Create some in the Permissions tab.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from(groupByBasePath(allPermissions).entries()).map(([basePath, perms]) => (
                <div key={basePath}>
                  <p className="text-muted-foreground mb-1.5 font-mono text-[11px] font-medium">
                    {basePath}
                    <span className="ml-1.5 text-[9px] font-normal opacity-60">{perms.length}</span>
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((perm) => (
                      <PermissionToggle
                        key={perm.id}
                        roleSlug={role.slug}
                        permission={perm}
                        active={assignedIds.has(perm.id)}
                        disabled={role.slug === 'admin'}
                        inherited={inheritedIds.has(perm.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
