import type { DrizzleDb } from '../db';
import type { MediaItem, PaginatedMedia, UpdateMediaInput, UploadMediaInput } from '../types';
import { createId } from '@paralleldrive/cuid2';
import { count, eq, inArray, isNull } from 'drizzle-orm';
import { media } from '~/models';
import { AuthorizationError, NotFoundError, ValidationError } from '../errors';

type R2Bucket = CloudflareBindings['STORAGE'];

export type { MediaItem, PaginatedMedia, UploadMediaInput };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function attachUrl(item: Record<string, unknown>, r2PublicUrl: string): MediaItem {
  return { ...item, url: `${r2PublicUrl}/${item.bucketKey}` } as MediaItem;
}

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * List non-deleted media with pagination
 */
export async function listMedia(
  db: DrizzleDb,
  r2PublicUrl: string,
  pagination: { limit: number; offset: number },
): Promise<PaginatedMedia> {
  const [data, [{ total }]] = await Promise.all([
    db.query.media.findMany({
      where: { deletedAt: { isNull: true } },
      orderBy: (t, { desc }) => desc(t.createdAt),
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    db.select({ total: count() }).from(media).where(isNull(media.deletedAt)),
  ]);

  return {
    data: data.map((item) => attachUrl(item as Record<string, unknown>, r2PublicUrl)),
    total,
  };
}

/**
 * Get a single media item by ID
 */
export async function getMediaById(db: DrizzleDb, r2PublicUrl: string, id: string): Promise<MediaItem> {
  const item = await db.query.media.findFirst({
    where: { id },
  });

  if (!item || item.deletedAt) throw new NotFoundError('Media');

  return attachUrl(item as Record<string, unknown>, r2PublicUrl);
}

/**
 * Upload a file to R2 and save metadata to DB
 */
export async function uploadMedia(
  db: DrizzleDb,
  storage: R2Bucket,
  r2PublicUrl: string,
  input: UploadMediaInput,
): Promise<MediaItem> {
  if (!(input.file instanceof File)) {
    throw new ValidationError('Field "file" must be a File instance', 'VALIDATION_FAILED');
  }

  const id = createId();
  const ext = input.file.name.split('.').pop() ?? '';
  const bucketKey = `media/${id}${ext ? '.' + ext : ''}`;

  await storage.put(bucketKey, await input.file.arrayBuffer(), {
    httpMetadata: { contentType: input.file.type },
    customMetadata: { originalName: input.file.name, uploadedBy: input.uploadedBy },
  });

  const [record] = await db
    .insert(media)
    .values({
      fileName: input.file.name,
      mimeType: input.file.type,
      fileSize: input.file.size,
      bucketKey,
      title: input.title ?? input.file.name,
      description: input.description ?? null,
      tags: input.tags ?? null,
      createdBy: input.uploadedBy,
    })
    .returning();

  return attachUrl(record as Record<string, unknown>, r2PublicUrl);
}

/**
 * Update media metadata — only uploader or admin
 */
export async function updateMedia(
  db: DrizzleDb,
  r2PublicUrl: string,
  id: string,
  input: UpdateMediaInput,
  actorId: string,
  actorRole: string,
): Promise<MediaItem> {
  const existing = await db.query.media.findFirst({
    where: { id },
  });

  if (!existing || existing.deletedAt) throw new NotFoundError('Media');

  if (existing.createdBy !== actorId && actorRole !== 'admin') {
    throw new AuthorizationError('Insufficient permissions', 'FORBIDDEN');
  }

  const [updated] = await db
    .update(media)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      updatedAt: new Date(),
      updatedBy: actorId,
    })
    .where(eq(media.id, id))
    .returning();

  return attachUrl(updated as Record<string, unknown>, r2PublicUrl);
}

/**
 * Delete media from R2 and soft-delete DB record — only uploader or admin
 */
export async function deleteMedia(db: DrizzleDb, storage: R2Bucket, id: string, actorId: string, actorRole: string): Promise<void> {
  const existing = await db.query.media.findFirst({
    where: { id },
  });

  if (!existing || existing.deletedAt) throw new NotFoundError('Media');

  if (existing.createdBy !== actorId && actorRole !== 'admin') {
    throw new AuthorizationError('Insufficient permissions', 'FORBIDDEN');
  }

  await storage.delete(existing.bucketKey);
  await db.update(media).set({ deletedAt: new Date(), deletedBy: actorId }).where(eq(media.id, id));
}

/**
 * Batch-delete multiple media items — admin only or all owned by actor.
 */
export async function batchDeleteMedia(
  db: DrizzleDb,
  storage: R2Bucket,
  ids: string[],
  actorId: string,
  actorRole: string,
): Promise<{ deleted: number }> {
  if (ids.length === 0) return { deleted: 0 };

  const rows = await db.query.media.findMany({
    where: { id: { in: ids } },
  });

  const active = rows.filter((r) => !r.deletedAt);

  if (actorRole !== 'admin') {
    const forbidden = active.filter((r) => r.createdBy !== actorId);
    if (forbidden.length > 0) {
      throw new AuthorizationError('Insufficient permissions to delete one or more files', 'FORBIDDEN');
    }
  }

  await Promise.allSettled(active.map((r) => storage.delete(r.bucketKey)));

  const activeIds = active.map((r) => r.id);
  if (activeIds.length > 0) {
    await db.update(media).set({ deletedAt: new Date() }).where(inArray(media.id, activeIds));
  }

  return { deleted: activeIds.length };
}
