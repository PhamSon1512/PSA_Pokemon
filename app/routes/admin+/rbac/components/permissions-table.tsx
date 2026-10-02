import type { Permission } from '../types';
import { Fragment } from 'react';
import { KeyRound } from 'lucide-react';
import { cn } from '~/lib/utils';
import { groupByBasePath } from '../helpers';
import { PermissionRow } from './permission-row';

export function PermissionsGroupedTable({ permissions }: { permissions: Permission[] }) {
  if (permissions.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <KeyRound className="text-muted-foreground/30 size-8" />
        <p className="text-muted-foreground text-sm">No permissions yet. Sync from routes or add manually.</p>
      </div>
    );
  }

  const groups = groupByBasePath(permissions);

  // Single table — all groups share the same column widths via colgroup
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[90px]" />
          <col /> {/* description: takes remaining space */}
          <col className="w-10" />
        </colgroup>
        <thead>
          <tr className="border-border bg-muted/30 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">Resource</th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">Method</th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">Description</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {Array.from(groups.entries()).map(([basePath, perms], groupIdx) => (
            // Fragment with key — required when rendering lists of multi-element groups
            <Fragment key={basePath}>
              {/* Group separator row */}
              <tr className={cn('bg-muted/40', groupIdx > 0 && 'border-border border-t-2')}>
                <td colSpan={4} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono text-xs font-semibold">{basePath}</code>
                    <span className="text-muted-foreground text-[10px]">
                      {perms.length} method{perms.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
              </tr>
              {/* Data rows */}
              {perms.map((p) => (
                <PermissionRow key={p.id} permission={p} />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
