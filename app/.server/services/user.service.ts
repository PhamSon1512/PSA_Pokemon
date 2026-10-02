import type { DrizzleDb } from '../db';
import type { PaginatedUsers, SafeUser, UpdateUserInput } from '../types';
import { count, eq, isNull } from 'drizzle-orm';
import { users } from '~/models';
import { AuthorizationError, NotFoundError } from '../errors';
import { buildPatch } from './_helpers';
import { toSafeUser } from './_user-mapper';

export type { SafeUser, PaginatedUsers };

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * List active (non-deleted) users with pagination
 */
export async function listUsers(db: DrizzleDb, pagination: { limit: number; offset: number }): Promise<PaginatedUsers> {
  const [data, [{ total }]] = await Promise.all([
    db.query.users.findMany({
      where: { deletedAt: { isNull: true } },
      orderBy: (t, { desc }) => desc(t.createdAt),
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    db.select({ total: count() }).from(users).where(isNull(users.deletedAt)),
  ]);

  return { data: data.map(toSafeUser), total };
}

/**
 * Get a single user by ID — throws NotFoundError if missing/deleted
 */
export async function getUserById(db: DrizzleDb, id: string): Promise<SafeUser> {
  const user = await db.query.users.findFirst({
    where: { id },
  });

  if (!user || user.deletedAt) throw new NotFoundError('User');

  return toSafeUser(user);
}

/**
 * Update a user's profile.
 * Only admins may change role. Pass `actorRole` to enforce rule.
 */
export async function updateUser(db: DrizzleDb, id: string, input: UpdateUserInput, actorRole: string): Promise<SafeUser> {
  const existing = await db.query.users.findFirst({
    where: { id },
  });

  if (!existing || existing.deletedAt) throw new NotFoundError('User');

  if (input.role !== undefined && actorRole !== 'admin') {
    throw new AuthorizationError('Only admins can change user roles', 'FORBIDDEN');
  }

  const [updated] = await db
    .update(users)
    .set(buildPatch(input, ['firstName', 'lastName', 'fullName', 'role']))
    .where(eq(users.id, id))
    .returning();

  return toSafeUser(updated);
}

/**
 * Soft-delete a user (admin only — caller must check role before calling)
 */
export async function softDeleteUser(db: DrizzleDb, id: string): Promise<void> {
  const existing = await db.query.users.findFirst({
    where: { id },
  });

  if (!existing || existing.deletedAt) throw new NotFoundError('User');

  await db.update(users).set({ deletedAt: new Date(), refreshToken: null }).where(eq(users.id, id));
}
