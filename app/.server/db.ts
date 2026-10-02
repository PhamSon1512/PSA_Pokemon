import type { AppLoadContext } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { schemaRelations } from '~/models/relations';

// Create Drizzle D1 client from Cloudflare context binding
export function getDb(context: AppLoadContext) {
  return drizzle(context.cloudflare.env.DB, { relations: schemaRelations });
}

/** Shared Drizzle DB type — use in services instead of re-declaring ReturnType<typeof getDb> */
export type DrizzleDb = ReturnType<typeof getDb>;
