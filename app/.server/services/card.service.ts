import { desc, eq, isNull, like, or } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { cards } from '~/models/card';

export async function getCardByCertNumber(db: DrizzleD1Database<any>, certNumber: string) {
  const [card] = await db.select().from(cards).where(eq(cards.certNumber, certNumber)).limit(1);
  return card;
}

export async function searchCards(db: DrizzleD1Database<any>, q?: string) {
  let query = db.select().from(cards).where(isNull(cards.deletedAt)).$dynamic();

  // Search by certNumber or cardName
  if (q) {
    const searchStr = q.replace(/^#/, ''); // Remove # if present for cert search
    query = query.where(or(like(cards.certNumber, `%${searchStr}%`), like(cards.cardName, `%${q}%`))) as any;
  }

  return query.limit(10).orderBy(desc(cards.createdAt));
}

export async function listAdminCards(db: DrizzleD1Database<any>) {
  return db.select().from(cards).where(isNull(cards.deletedAt)).orderBy(desc(cards.createdAt));
}

export async function createCard(db: DrizzleD1Database<any>, data: any, actorId: string) {
  const [card] = await db
    .insert(cards)
    .values({ ...data, createdBy: actorId })
    .returning();
  return card;
}

export async function updateCard(db: DrizzleD1Database<any>, id: string, data: any, actorId: string) {
  const [card] = await db
    .update(cards)
    .set({ ...data, updatedBy: actorId, updatedAt: new Date() })
    .where(eq(cards.id, id))
    .returning();
  return card;
}

export async function deleteCard(db: DrizzleD1Database<any>, id: string, actorId: string) {
  await db.update(cards).set({ deletedBy: actorId, deletedAt: new Date() }).where(eq(cards.id, id));
  return true;
}
