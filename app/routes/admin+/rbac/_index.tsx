import type { Route } from './+types/_index';
import type { Role } from './types';
import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { EmptyState } from '~/components/admin/empty-state';
import { PageHeader } from '~/components/admin/page-header';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { CreatePermissionDialog } from './components/permission-dialog';
import { PermissionsGroupedTable } from './components/permissions-table';
import { CreateRoleDialog, EditRoleDialog } from './components/role-dialogs';
import { RoleRow } from './components/role-row';
import { SeedDefaultsButton } from './components/seed-defaults-button';
import { SyncBar } from './components/sync-bar';
import { getInheritedIds } from './helpers';

// ─── Server exports (loader lives in a separate server-only file) ──────────────
export { loader } from './loader.server';

// ─── Meta ─────────────────────────────────────────────────────────────────────
export const meta = (_: Route.MetaArgs) => [
  { title: 'Roles & Permissions — Admin Portal' },
  { name: 'description', content: 'Manage RBAC roles and permission assignments' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RbacPage({ loaderData }: Route.ComponentProps) {
  const { roles, permissions, rolePermissions, missing } = loaderData;
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreatePermission, setShowCreatePermission] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        subtitle={
          <>
            {roles.length} roles · {permissions.length} permissions
            {missing.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[rgba(245,158,11,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#d97706]">
                {missing.length} unsynced
              </span>
            )}
          </>
        }
        action={
          activeTab === 'roles' ? (
            <>
              <SeedDefaultsButton />
              <Button size="sm" onClick={() => setShowCreateRole(true)}>
                <Plus className="size-3.5" />
                New role
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setShowCreatePermission(true)}>
              <Plus className="size-3.5" />
              New permission
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="border-border bg-muted/40 flex w-fit gap-1 rounded-xl border p-1">
        {(['roles', 'permissions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
            {tab === 'permissions' && missing.length > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-[#d97706] text-[9px] font-bold text-white">
                {missing.length > 9 ? '9+' : missing.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Roles Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="flex flex-col gap-3">
          {roles.map((r) => (
            <RoleRow
              key={r.slug}
              role={r}
              allPermissions={permissions}
              assigned={rolePermissions[r.slug] ?? []}
              inheritedIds={getInheritedIds(r.slug, roles, rolePermissions)}
              expanded={expandedRole === r.slug}
              onToggle={() => setExpandedRole(expandedRole === r.slug ? null : r.slug)}
              onEdit={() => setEditingRole(r)}
            />
          ))}

          {roles.length === 0 && (
            <div className="border-border rounded-xl border border-dashed">
              <EmptyState
                icon={Shield}
                message={
                  <>
                    No roles yet — click <strong>Seed defaults</strong> above to add user &amp; admin roles
                  </>
                }
              />
            </div>
          )}
        </div>
      )}

      {/* ── Permissions Tab ───────────────────────────────────────────── */}
      {activeTab === 'permissions' && (
        <div className="flex flex-col gap-3">
          <SyncBar missing={missing} />
          <PermissionsGroupedTable permissions={permissions} />
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      <CreateRoleDialog open={showCreateRole} roles={roles} onClose={() => setShowCreateRole(false)} />
      <EditRoleDialog role={editingRole} roles={roles} onClose={() => setEditingRole(null)} />
      <CreatePermissionDialog open={showCreatePermission} onClose={() => setShowCreatePermission(false)} />
    </div>
  );
}
