import type { DrizzleDb } from '../db';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import { NotFoundError } from '../errors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetaItem = {
  id: string;
  metaKey: string;
  metaValue: string | null;
};

export type UpsertMetaInput = {
  metaKey: string;
  metaValue?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDrizzleTable = Record<string, any>;

export type MetaTableConfig = {
  /** The drizzle table object (e.g. postMeta, userMeta) */
  table: AnyDrizzleTable;
  /** Column name that holds the FK reference to the owning entity (e.g. "postId", "userId") */
  ownerCol: string;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a fully-typed meta service for any entity (OCP + DRY).
 * Eliminates the near-identical code in post-meta.service and user-meta.service.
 *
 * @example
 *   export const postMetaService = createMetaService({
 *     table: postMeta,
 *     ownerCol: 'postId',
 *   });
 */
export function createMetaService(config: MetaTableConfig) {
  const { table, ownerCol } = config;

  /** Get all meta entries for an owner */
  async function getAll(db: DrizzleDb, ownerId: string): Promise<MetaItem[]> {
    const rows = await db
      .select()
      .from(table as any)
      .where(eq(table[ownerCol], ownerId));
    return rows as unknown as MetaItem[];
  }

  /** Get a single meta value by owner ID and key */
  async function getValue(db: DrizzleDb, ownerId: string, metaKey: string): Promise<string | null> {
    const row = await db
      .select()
      .from(table as any)
      .where(and(eq(table[ownerCol], ownerId), eq(table['metaKey'], metaKey)))
      .limit(1)
      .then((r: any[]) => r[0]);
    return row?.metaValue ?? null;
  }

  /** Upsert a single meta entry */
  async function upsert(db: DrizzleDb, ownerId: string, input: UpsertMetaInput): Promise<MetaItem> {
    const existing = await db
      .select()
      .from(table as any)
      .where(and(eq(table[ownerCol], ownerId), eq(table['metaKey'], input.metaKey)))
      .limit(1)
      .then((r: any[]) => r[0]);

    if (existing) {
      const result = await db
        .update(table as any)
        .set({ metaValue: input.metaValue ?? null })
        .where(eq(table['id'], existing.id))
        .returning();
      return (result as any[])[0] as MetaItem;
    }

    const created = await db
      .insert(table as any)
      .values({
        id: createId(),
        [ownerCol]: ownerId,
        metaKey: input.metaKey,
        metaValue: input.metaValue ?? null,
      })
      .returning();

    return (created as any[])[0] as MetaItem;
  }

  /** Bulk upsert multiple meta entries */
  async function bulkUpsert(db: DrizzleDb, ownerId: string, entries: Record<string, string | null>): Promise<void> {
    for (const [metaKey, metaValue] of Object.entries(entries)) {
      await upsert(db, ownerId, { metaKey, metaValue });
    }
  }

  /** Delete a single meta entry by key */
  async function deleteMeta(db: DrizzleDb, ownerId: string, metaKey: string): Promise<void> {
    const existing = await db
      .select()
      .from(table as any)
      .where(and(eq(table[ownerCol], ownerId), eq(table['metaKey'], metaKey)))
      .limit(1)
      .then((r: any[]) => r[0]);
    if (!existing) throw new NotFoundError(`Meta key "${metaKey}"`);

    await db.delete(table as any).where(eq(table['id'], existing.id));
  }

  /** Delete ALL meta entries for an owner (called on entity deletion) */
  async function deleteAll(db: DrizzleDb, ownerId: string): Promise<void> {
    await db.delete(table as any).where(eq(table[ownerCol], ownerId));
  }

  return { getAll, getValue, upsert, bulkUpsert, deleteMeta, deleteAll };
}
