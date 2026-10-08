import { and, desc, eq, isNull } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { products } from '~/models/product';

export async function getProductBySlug(db: DrizzleD1Database<any>, slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), isNull(products.deletedAt)))
    .limit(1);
  return product;
}

export async function getProductById(db: DrizzleD1Database<any>, id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), isNull(products.deletedAt)))
    .limit(1);
  return product;
}

export async function getPublicProducts(db: DrizzleD1Database<any>) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.status, 'ACTIVE'), isNull(products.deletedAt)))
    .orderBy(desc(products.createdAt));
}

export async function listAdminProducts(db: DrizzleD1Database<any>) {
  return db.select().from(products).where(isNull(products.deletedAt)).orderBy(desc(products.createdAt));
}

export async function createProduct(db: DrizzleD1Database<any>, data: any, actorId: string) {
  const [product] = await db
    .insert(products)
    .values({ ...data, createdBy: actorId })
    .returning();
  return product;
}

export async function updateProduct(db: DrizzleD1Database<any>, id: string, data: any) {
  const [product] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return product;
}

export async function deleteProduct(db: DrizzleD1Database<any>, id: string) {
  await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id));
  return true;
}
