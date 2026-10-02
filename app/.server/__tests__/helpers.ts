/**
 * Shared test helpers for .server integration tests.
 * Uses real Cloudflare D1 in-memory via @cloudflare/vitest-pool-workers.
 */

/// <reference types="@cloudflare/vitest-pool-workers" />
import { env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { schemaRelations } from '~/models/relations';

// ─── DB factory ───────────────────────────────────────────────────────────────

export function getDb() {
  return drizzle(env.DB, { relations: schemaRelations });
}

export type TestDb = ReturnType<typeof getDb>;

// ─── DDL strings ────────────────────────────────────────────────────────────────

export const ROLES_DDL = [
  `CREATE TABLE IF NOT EXISTS roles (
    slug TEXT PRIMARY KEY NOT NULL CHECK(slug NOT LIKE '% %'),
    name TEXT NOT NULL,
    description TEXT,
    parent_slug TEXT REFERENCES roles(slug) ON DELETE SET NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`,
];

export const PERMISSIONS_DDL = [
  `CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS permission_resource_action_idx ON permissions (resource, action)`,
];

export const ROLE_PERMISSIONS_DDL = [
  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_slug TEXT NOT NULL REFERENCES roles(slug) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (role_slug, permission_id)
  )`,
  `CREATE INDEX IF NOT EXISTS role_permissions_role_idx ON role_permissions (role_slug)`,
  `CREATE INDEX IF NOT EXISTS role_permissions_perm_idx ON role_permissions (permission_id)`,
];

export const USERS_DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user' REFERENCES roles(slug) ON DELETE SET NULL,
    refresh_token TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    deleted_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS user_deleted_at_idx ON users (deleted_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_udx ON users (email) WHERE deleted_at IS NULL`,
];

export const MEDIA_DDL = [
  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK(file_size > 0),
    bucket_key TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    tags TEXT,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    deleted_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    deleted_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS media_created_by_idx ON media (created_by)`,
  `CREATE INDEX IF NOT EXISTS media_updated_by_idx ON media (updated_by)`,
  `CREATE INDEX IF NOT EXISTS media_deleted_by_idx ON media (deleted_by)`,
  `CREATE INDEX IF NOT EXISTS media_deleted_at_idx ON media (deleted_at)`,
];

// ─── Convenience: run a list of DDL statements ────────────────────────────────

export async function execDDL(...groups: string[][]): Promise<void> {
  for (const group of groups) {
    for (const ddl of group) {
      await env.DB.prepare(ddl).run();
    }
  }
}
