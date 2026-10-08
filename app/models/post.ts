import { createId } from '@paralleldrive/cuid2';
import { index, integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const posts = table(
  'posts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'), // meta description
    content: text('content'), // markdown
    coverImage: text('cover_image'),
    category: text('category', { enum: ['NEWS', 'GUIDE', 'REVIEW', 'MARKET_ANALYSIS'] }).default('NEWS'),
    tags: text('tags', { mode: 'json' }).$type<string[]>(),
    status: text('status', { enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
      .notNull()
      .default('DRAFT'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    authorId: text('author_id').references(() => users.id),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    viewCount: integer('view_count').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => [index('posts_slug_idx').on(t.slug), index('posts_status_idx').on(t.status)],
);
