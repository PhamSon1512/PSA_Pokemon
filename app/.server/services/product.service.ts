import { and, count, desc, eq, isNull, like, or } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { products } from '~/models/product';

export interface ListAdminProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
}

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

export async function listAdminProducts(db: DrizzleD1Database<any>, params: ListAdminProductsParams = {}) {
  const { page = 1, pageSize = 20, search, category, status, sortBy = 'newest' } = params;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions: any[] = [isNull(products.deletedAt)];
  if (category && category !== 'all') conditions.push(eq(products.category, category));
  if (status && status !== 'all') conditions.push(eq(products.status, status as any));
  if (search) {
    conditions.push(
      or(like(products.name, `%${search}%`), like(products.slug, `%${search}%`), like(products.category, `%${search}%`)),
    );
  }

  const where = and(...conditions);

  // Sort order
  const orderBy =
    sortBy === 'price-asc'
      ? products.price
      : sortBy === 'price-desc'
        ? desc(products.price)
        : sortBy === 'stock-desc'
          ? desc(products.stock)
          : desc(products.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(products).where(where).orderBy(orderBy).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return {
    products: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
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
