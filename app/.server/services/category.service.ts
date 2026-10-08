import type { DrizzleDb } from '../db';
import { count, desc, eq, isNull } from 'drizzle-orm';
import { categories } from '~/models';

export async function listCategories(db: DrizzleDb) {
  return db.select().from(categories).where(isNull(categories.deletedAt)).orderBy(desc(categories.createdAt));
}

export async function createCategory(db: DrizzleDb, data: any, actorId: string) {
  const [category] = await db
    .insert(categories)
    .values({ ...data, createdBy: actorId })
    .returning();
  return category;
}

export async function updateCategory(db: DrizzleDb, id: string, data: any) {
  const [category] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return category;
}

export async function deleteCategory(db: DrizzleDb, id: string) {
  await db.update(categories).set({ deletedAt: new Date() }).where(eq(categories.id, id));
  return true;
}
