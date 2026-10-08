import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const products = table('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(), // VND, stored as integer
  comparePrice: integer('compare_price'),
  image: text('image'),
  images: text('images', { mode: 'json' }).$type<string[]>(),
  category: text('category'),
  badges: text('badges', { mode: 'json' }).$type<string[]>(),
  sold: integer('sold').notNull().default(0),
  type: text('type', { enum: ['MYSTERY_BAG', 'NORMAL'] })
    .notNull()
    .default('NORMAL'),
  stock: integer('stock').notNull().default(0),
  status: text('status', { enum: ['DRAFT', 'ACTIVE', 'SOLD_OUT'] })
    .notNull()
    .default('DRAFT'),

  // SEO fields
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),

  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});
