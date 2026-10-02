import type { DrizzleDb } from '../db';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import { permissions, rolePermissions, roles } from '~/models';
import { invalidatePolicyCache } from '../rbac';

// ─── Seed initial data ────────────────────────────────────────────────────────

/**
 * Idempotent seed — safe to run on every deployment.
 * Two roles: `user` (default for all signups) and `admin` (full wildcard access).
 */
export async function seedRbac(db: DrizzleDb): Promise<void> {
  // ── 1. Seed roles ──
  const defaultRoles: Array<{ slug: string; name: string; description: string }> = [
    { slug: 'user', name: 'User', description: 'Default role for all registered users' },
    { slug: 'admin', name: 'Admin', description: 'Full system access' },
  ];

  for (const role of defaultRoles) {
    await db.insert(roles).values(role).onConflictDoNothing();
  }

  // ── 2. Seed permissions ──
  const defaultPerms: Array<{ resource: string; action: string; description: string }> = [
    // Users — own profile management
    { resource: '/api/users/:id', action: 'GET', description: 'Get user by ID' },
    { resource: '/api/users/:id', action: 'PATCH', description: 'Update own profile' },
    // Media — read access for all users
    { resource: '/api/media', action: 'GET', description: 'List media' },
    { resource: '/api/media/:id', action: 'GET', description: 'Get media item' },
    // Wildcard — admin only
    { resource: '*', action: '*', description: 'Full wildcard access (admin)' },
  ];

  const insertedPerms: Record<string, string> = {}; // "resource:action" → id

  for (const p of defaultPerms) {
    const [inserted] = await db
      .insert(permissions)
      .values({ ...p, id: createId() })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      insertedPerms[`${p.resource}:${p.action}`] = inserted.id;
    } else {
      // Already existed — fetch id via standard select (db.query not available in v1 beta)
      const existing = await db
        .select()
        .from(permissions)
        .where(and(eq(permissions.resource, p.resource), eq(permissions.action, p.action)))
        .limit(1)
        .then((r) => r[0]);
      if (existing) insertedPerms[`${p.resource}:${p.action}`] = existing.id;
    }
  }

  // ── 3. Assign permissions to roles ──
  const assignments: Array<{ roleSlug: string; permKey: string }> = [
    // user: own profile + read media
    { roleSlug: 'user', permKey: '/api/users/:id:GET' },
    { roleSlug: 'user', permKey: '/api/users/:id:PATCH' },
    { roleSlug: 'user', permKey: '/api/media:GET' },
    { roleSlug: 'user', permKey: '/api/media/:id:GET' },
    // admin: wildcard — covers everything
    { roleSlug: 'admin', permKey: '*:*' },
  ];

  for (const { roleSlug, permKey } of assignments) {
    const permissionId = insertedPerms[permKey];
    if (!permissionId) continue;
    await db.insert(rolePermissions).values({ roleSlug, permissionId }).onConflictDoNothing();
  }

  invalidatePolicyCache();
}
