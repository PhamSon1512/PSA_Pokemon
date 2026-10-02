import type { DrizzleDb } from '../db';
import { eq } from 'drizzle-orm';
import { roles } from '~/models';
import { ConflictError, NotFoundError } from '../errors';
import { invalidatePolicyCache } from '../rbac';

// ─── Role CRUD ────────────────────────────────────────────────────────────────

export async function listRoles(db: DrizzleDb) {
  return db.query.roles.findMany();
}

export async function createRole(db: DrizzleDb, input: { slug: string; name: string; description?: string; parentSlug?: string }) {
  const existing = await db.query.roles.findFirst({
    where: { slug: input.slug },
  });
  if (existing) throw new ConflictError(`Role "${input.slug}" already exists`, 'CONFLICT');

  if (input.parentSlug) {
    const parent = await db.query.roles.findFirst({
      where: { slug: input.parentSlug },
    });
    if (!parent) throw new NotFoundError(`Parent role "${input.parentSlug}"`, 'NOT_FOUND');
  }

  const [role] = await db.insert(roles).values(input).returning();
  invalidatePolicyCache();
  return role;
}

export async function updateRole(
  db: DrizzleDb,
  slug: string,
  input: Partial<{ name: string; description: string; parentSlug: string | null }>,
) {
  const existing = await db.query.roles.findFirst({
    where: { slug },
  });
  if (!existing) throw new NotFoundError(`Role "${slug}"`, 'NOT_FOUND');

  const [updated] = await db.update(roles).set(input).where(eq(roles.slug, slug)).returning();
  invalidatePolicyCache();
  return updated;
}

export async function deleteRole(db: DrizzleDb, slug: string) {
  const existing = await db.query.roles.findFirst({
    where: { slug },
  });
  if (!existing) throw new NotFoundError(`Role "${slug}"`, 'NOT_FOUND');

  await db.delete(roles).where(eq(roles.slug, slug));
  invalidatePolicyCache();
}
