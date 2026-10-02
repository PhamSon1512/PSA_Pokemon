import type { Route } from './+types/media';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requireAuthSession, requirePermission } from '~/.server/guard';
import { badRequest, created, ok, parsePagination } from '~/.server/response';
import { listMedia, uploadMedia } from '~/.server/services/media.service';
import { UploadMediaMetaSchema } from '~/openapi/media.openapi';

// GET /api/media — list media files (all authenticated users via Casbin)
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const { env } = context.cloudflare;

  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  const { page, limit, offset } = parsePagination(request.url);
  const { data, total } = await listMedia(getDb(context), env.R2_PUBLIC_URL, { limit, offset });
  return ok(data, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

// POST /api/media — upload file to R2 (editor + admin via Casbin)
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  if (request.method !== 'POST') return badRequest('Method not allowed');

  const { env } = context.cloudflare;

  const { user } = await requireAuthSession(request, context);

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return badRequest('Content-Type must be multipart/form-data');
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest('Failed to parse form data');
  }

  // Validate file field (must be a File instance, not string)
  const file = formData.get('file');
  if (!(file instanceof File)) return badRequest('Field "file" is required');

  // Guard against oversized uploads — Cloudflare Workers has a 128 MB memory limit;
  // cap at 50 MB to leave headroom for processing (image dimension parsing, etc.)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  if (file.size > MAX_FILE_SIZE) {
    return badRequest(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 50 MB limit`);
  }

  // Validate optional metadata via schema (handles tags as JSON array or comma-separated)
  const rawMeta = {
    title: formData.get('title') ?? undefined,
    description: formData.get('description') ?? undefined,
    tags: (() => {
      const raw = formData.get('tags') as string | null;
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as string[];
      } catch {
        return raw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    })(),
  };

  const metaResult = UploadMediaMetaSchema.safeParse(rawMeta);
  if (!metaResult.success) return badRequest(metaResult.error.message);

  const record = await uploadMedia(getDb(context), env.STORAGE, env.R2_PUBLIC_URL, {
    file,
    ...metaResult.data,
    uploadedBy: user!.id,
  });
  return created(record);
});
