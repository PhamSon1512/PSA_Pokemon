import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable as table, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { roles } from './rbac';

export const users = table(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').notNull(), // unique enforced via partial index (active users only)
    password: text('password').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    fullName: text('full_name'),
    // SEC-8: 'set null' instead of 'set default' — SQLite does not support ON DELETE SET DEFAULT.
    // LOGIC-19: role 'user' MUST be seeded in DB before any signup — FK will fail otherwise.
    role: text('role')
      .default('user')
      .references(() => roles.slug, { onDelete: 'set null' }),
    // LOGIC-18: stores SHA-256(refreshJWT), NOT the plain JWT.
    // Direct DB inserts MUST also store a hash — plain tokens will break auth.
    refreshToken: text('refresh_token'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (t) => [
    // LOGIC-14: partial unique index — only active (non-deleted) users must have unique emails.
    // Soft-deleted users can free up their email for re-registration.
    index('user_deleted_at_idx').on(t.deletedAt),
    uniqueIndex('users_email_active_udx')
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);
