import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const badges = table('badges', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  color: text('color'), // hex color e.g. #f59e0b
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});
