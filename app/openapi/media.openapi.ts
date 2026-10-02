import { createRoute, z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import { defaultResponses, IdParamSchema, jsonContent, PaginationQuerySchema } from '~/lib/openapi';
import { media } from '~/models';

// Auto-generated from Drizzle model
const MediaSelectSchema = createSelectSchema(media);

// Override fields drizzle-zod may infer as `unknown` (nullable text columns)
const MediaInsertSchema = createInsertSchema(media, {
  title: z.string().min(1).max(255),
  description: z.string().max(2000),
});

export const MediaPublicSchema = MediaSelectSchema.omit({ deletedAt: true }).extend({
  // drizzle-zod may infer nullable text columns as `unknown`; override with correct types
  id: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  bucketKey: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  // `url` is appended at service layer — add it here so MediaItem type includes it
  url: z.string(),
});

// ─── With relations ────────────────────────────────────────────────────────────

/** Media item with uploader info */
export const MediaWithAuthorSchema = MediaPublicSchema.extend({
  createdBy: z.object({ id: z.string(), fullName: z.string().nullable() }).nullable(),
});

// Named export — single source of truth for both Swagger doc and runtime validation
export const UpdateMediaBodySchema = MediaInsertSchema.pick({ title: true, description: true }).partial();

// Metadata fields for multipart upload (file itself is validated manually as File instance)
export const UploadMediaMetaSchema = UpdateMediaBodySchema;

// ── Media routes ───────────────────────────────────────────────────────────────

export const listMediaRoute = createRoute({
  method: 'get',
  path: '/api/media',
  tags: ['Media'],
  summary: 'List media files',
  request: { query: PaginationQuerySchema },
  responses: {
    200: jsonContent(
      z.object({
        data: z.array(MediaPublicSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
      'Paginated media list',
    ),
    ...defaultResponses,
  },
});

export const uploadMediaRoute = createRoute({
  method: 'post',
  path: '/api/media',
  tags: ['Media'],
  summary: 'Upload a file to R2 storage',
  request: {
    body: {
      description: 'Multipart form with file and optional metadata',
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().openapi({ format: 'binary', description: 'File to upload' }),
            title: z.string().max(255).optional(),
            description: z.string().max(2000).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: jsonContent(MediaPublicSchema, 'Created media record'),
    ...defaultResponses,
  },
});

export const getMediaRoute = createRoute({
  method: 'get',
  path: '/api/media/{id}',
  tags: ['Media'],
  summary: 'Get media item by ID',
  request: { params: IdParamSchema },
  responses: {
    200: jsonContent(MediaPublicSchema, 'Media object'),
    ...defaultResponses,
  },
});

export const updateMediaRoute = createRoute({
  method: 'patch',
  path: '/api/media/{id}',
  tags: ['Media'],
  summary: 'Update media metadata',
  request: {
    params: IdParamSchema,
    body: jsonContent(UpdateMediaBodySchema, 'Fields to update'),
  },
  responses: {
    200: jsonContent(MediaPublicSchema, 'Updated media'),
    ...defaultResponses,
  },
});

export const deleteMediaRoute = createRoute({
  method: 'delete',
  path: '/api/media/{id}',
  tags: ['Media'],
  summary: 'Delete media item from R2 and database',
  request: { params: IdParamSchema },
  responses: {
    204: { description: 'Deleted' },
    ...defaultResponses,
  },
});

export const batchDeleteMediaRoute = createRoute({
  method: 'post',
  path: '/api/media/batch-delete',
  tags: ['Media'],
  summary: 'Batch delete media items by IDs',
  request: {
    body: jsonContent(z.object({ ids: z.array(z.string()).min(1).max(100) }), 'Array of media IDs to delete'),
  },
  responses: {
    200: jsonContent(z.object({ deleted: z.number() }), 'Number of files deleted'),
    ...defaultResponses,
  },
});

// Auto-discovered by openapi.ts via import.meta.glob
const routes = [listMediaRoute, uploadMediaRoute, getMediaRoute, updateMediaRoute, deleteMediaRoute, batchDeleteMediaRoute];

export default routes;
