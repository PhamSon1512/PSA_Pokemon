import type { DrizzleDb } from '../db';
import { count, desc, eq, isNull } from 'drizzle-orm';
import { badges } from '~/models';

export async function listBadges(db: DrizzleDb) {
  return db.select().from(badges).where(isNull(badges.deletedAt)).orderBy(desc(badges.createdAt));
}

export async function createBadge(db: DrizzleDb, data: any, actorId: string) {
  const [badge] = await db
    .insert(badges)
    .values({ ...data, createdBy: actorId })
    .returning();
  return badge;
}

export async function updateBadge(db: DrizzleDb, id: string, data: any) {
  const [badge] = await db
    .update(badges)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(badges.id, id))
    .returning();
  return badge;
}

export async function deleteBadge(db: DrizzleDb, id: string) {
  await db.update(badges).set({ deletedAt: new Date() }).where(eq(badges.id, id));
  return true;
}
