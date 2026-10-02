import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable as table, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Roles: name-slugged records (e.g. "admin", "user").
 * parentSlug enables role inheritance — Casbin handles inheritance via `g` policy entries.
 */
export const roles = table(
  'roles',
  {
    // LOGIC-13: slug is IMMUTABLE after creation — SQLite has no ON UPDATE CASCADE.
    // Renaming a slug will orphan children (parentSlug), user.role, and rolePermissions FKs.
    // To rename: create new slug, migrate data, delete old slug in a transaction.
    slug: text('slug').primaryKey(), // e.g. "admin", "editor"
    name: text('name').notNull(), // display name: "Admin"
    description: text('description'),
    parentSlug: text('parent_slug').references((): any => roles.slug, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => [
    // LOGIC-20: enforce slug format at DB level — lowercase, no spaces.
    // This does NOT prevent UPDATEs (SQLite has no row-level triggers via Drizzle).
    // Treat slugs as immutable — see LOGIC-13 comment above.
    check('roles_slug_no_spaces', sql`${t.slug} NOT LIKE '% %'`),
    check('roles_slug_lowercase', sql`${t.slug} = lower(${t.slug})`),
  ],
);

/**
 * Permissions: resource path + HTTP method pairs.
 * resource uses keyMatch2 patterns: "/api/users/:id"
 * action is the HTTP method: "GET", "POST", "PATCH", "PUT", "DELETE", or "*"
 */
export const permissions = table(
  'permissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    resource: text('resource').notNull(), // e.g. "/api/users/:id"
    action: text('action').notNull(), // e.g. "GET" or "*"
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => [uniqueIndex('permission_resource_action_idx').on(t.resource, t.action)],
);

/**
 * Role ↔ Permission assignments (many-to-many join table).
 * Removing a row immediately revokes that permission on next policy reload.
 */
export const rolePermissions = table(
  'role_permissions',
  {
    roleSlug: text('role_slug')
      .notNull()
      .references(() => roles.slug, { onDelete: 'cascade' }),
    permissionId: text('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    // LOGIC-23: audit when a permission was granted to a role
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    // NOTE: this join table is insert/delete only — no updatedAt needed.
  },
  (t) => [
    primaryKey({ columns: [t.roleSlug, t.permissionId] }),
    // Index by roleSlug — efficient policy lookup per role
    index('role_permissions_role_idx').on(t.roleSlug),
    // Index by permissionId — avoids full scan on cascade delete of a permission
    index('role_permissions_perm_idx').on(t.permissionId),
  ],
);
