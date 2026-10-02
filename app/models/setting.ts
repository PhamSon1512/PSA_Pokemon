import { index, integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';

// ─── Site Settings (key-value store — like wp_options) ─────────────────────────
export const settings = table(
  'settings',
  {
    key: text('key').primaryKey(),
    value: text('value'), // JSON-encoded for complex values
    group: text('group').notNull().default('general'), // general, reading, writing, media, seo, etc.
    // Load on every request for cache-warm (like wp_options.autoload)
    autoload: integer('autoload', { mode: 'boolean' }).notNull().default(false),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$default(() => new Date()),
  },
  (t) => [index('settings_group_idx').on(t.group), index('settings_autoload_idx').on(t.autoload)],
);
