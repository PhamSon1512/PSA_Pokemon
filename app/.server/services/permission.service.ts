import type { DrizzleDb } from '../db';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import { permissions, rolePermissions, roles } from '~/models';
import { ConflictError, NotFoundError } from '../errors';
import { invalidatePolicyCache } from '../rbac';

// ─── Permission CRUD ──────────────────────────────────────────────────────────

export async function listPermissions(db: DrizzleDb) {
  return db.query.permissions.findMany();
}

export async function createPermission(db: DrizzleDb, input: { resource: string; action: string; description?: string }) {
  const existing = await db.query.permissions.findFirst({
    where: {
      AND: [{ resource: input.resource }, { action: input.action }],
    },
  });

  if (existing) {
    throw new ConflictError(`Permission "${input.action} ${input.resource}" already exists`, 'CONFLICT');
  }

  const [perm] = await db
    .insert(permissions)
    .values({ ...input, id: createId() })
    .returning();
  return perm;
}

export async function deletePermission(db: DrizzleDb, id: string) {
  const existing = await db.query.permissions.findFirst({
    where: { id },
  });
  if (!existing) throw new NotFoundError(`Permission "${id}"`, 'NOT_FOUND');

  await db.delete(permissions).where(eq(permissions.id, id));
  invalidatePolicyCache();
}

// ─── Role ↔ Permission assignment ────────────────────────────────────────────

export async function getRolePermissions(db: DrizzleDb, roleSlug: string) {
  const role = await db.query.roles.findFirst({
    where: { slug: roleSlug },
    with: {
      rolePermissions: {
        with: { permission: true },
      },
    },
  });

  if (!role) throw new NotFoundError(`Role "${roleSlug}"`, 'NOT_FOUND');

  return role.rolePermissions.map((rp) => rp.permission);
}

export async function assignPermission(db: DrizzleDb, roleSlug: string, permissionId: string) {
  const [role, perm] = await Promise.all([
    db.query.roles.findFirst({ where: { slug: roleSlug } }),
    db.query.permissions.findFirst({ where: { id: permissionId } }),
  ]);

  if (!role) throw new NotFoundError(`Role "${roleSlug}"`, 'NOT_FOUND');
  if (!perm) throw new NotFoundError(`Permission "${permissionId}"`, 'NOT_FOUND');

  await db.insert(rolePermissions).values({ roleSlug, permissionId }).onConflictDoNothing();
  invalidatePolicyCache();
}

export async function revokePermission(db: DrizzleDb, roleSlug: string, permissionId: string) {
  await db
    .delete(rolePermissions)
    .where(and(eq(rolePermissions.roleSlug, roleSlug), eq(rolePermissions.permissionId, permissionId)));
  invalidatePolicyCache();
}
