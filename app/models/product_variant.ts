import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { products } from './product';
import { users } from './user';

export const productVariants = table('product_variants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  sku: text('sku'),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  image: text('image'),

  // Specific card attributes
  condition: text('condition'),
  language: text('language'),
  finish: text('finish'),

  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});
