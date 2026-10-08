import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const categories = table('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  status: text('status', { enum: ['ACTIVE', 'INACTIVE'] })
    .notNull()
    .default('ACTIVE'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});
