import type { Route } from './+types/_index';
import type { UserItem } from './types';
import { useState } from 'react';
import { Plus, UserRound } from 'lucide-react';
import { EmptyState } from '~/components/admin/empty-state';
import { PageHeader } from '~/components/admin/page-header';
import { Pagination } from '~/components/admin/pagination';
import { SearchInput } from '~/components/admin/search-input';
import { Button } from '~/components/ui/button';
import { CreateUserDialog } from './components/create-user-dialog';
import { DeleteUserDialog } from './components/delete-user-dialog';
import { EditUserDialog } from './components/edit-user-dialog';
import { UserRow } from './components/user-row';
import { getDisplayName } from './helpers';

// ─── Server exports ────────────────────────────────────────────────────────────
export { loader } from './loader.server';

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const meta = (_: Route.MetaArgs) => [
  { title: 'User Management — Admin Portal' },
  { name: 'description', content: 'Manage user accounts and roles' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const { users, roles, total, page, totalPages } = loaderData;

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.toLowerCase();
        return u.email.toLowerCase().includes(q) || getDisplayName(u).toLowerCase().includes(q);
      })
    : users;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        subtitle={`${total} total user${total !== 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="size-3.5" />
            New user
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Filter by email or name…" />

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {filtered.length === 0 ? (
          <EmptyState icon={UserRound} message={search ? 'No users match your search' : 'No users yet'} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/30 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">User</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">Role</th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wide uppercase sm:table-cell">
                  Joined
                </th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((u) => (
                <UserRow key={u.id} user={u} onEdit={() => setEditingUser(u)} onDelete={() => setDeletingUser(u)} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} itemLabel="user" />

      {/* Dialogs */}
      <CreateUserDialog open={showCreate} roles={roles} onClose={() => setShowCreate(false)} />
      <EditUserDialog user={editingUser} roles={roles} onClose={() => setEditingUser(null)} />
      <DeleteUserDialog user={deletingUser} onClose={() => setDeletingUser(null)} />
    </div>
  );
}
