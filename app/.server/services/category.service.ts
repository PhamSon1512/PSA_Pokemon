import type { DrizzleDb } from '../db';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { categories, products } from '~/models';

export async function listCategories(db: DrizzleDb) {
  return db.select().from(categories).where(isNull(categories.deletedAt)).orderBy(desc(categories.createdAt));
}

export async function listActiveCategories(db: DrizzleDb) {
  return db
    .select()
    .from(categories)
    .where(and(isNull(categories.deletedAt), eq(categories.status, 'ACTIVE')))
    .orderBy(desc(categories.createdAt));
}

/** Categories with product count for admin list */
export async function listCategoriesWithCount(db: DrizzleDb) {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      status: categories.status,
      createdAt: categories.createdAt,
      productCount:
        sql<number>`count(case when ${products.deletedAt} is null and ${products.category} = ${categories.name} then 1 end)`.as(
          'productCount',
        ),
    })
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(desc(categories.createdAt));
  return rows;
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
