import type { AppLoadContext } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { media, permissions, rolePermissions, roles, schemaRelations, settings, users } from '~/models';

const schema = { users, media, roles, permissions, rolePermissions, settings, schemaRelations };

// Create Drizzle D1 client from Cloudflare context binding
export function getDb(context: AppLoadContext) {
  return drizzle(context.cloudflare.env.DB, { schema });
}

/** Shared Drizzle DB type — use in services instead of re-declaring ReturnType<typeof getDb> */
export type DrizzleDb = ReturnType<typeof getDb>;
