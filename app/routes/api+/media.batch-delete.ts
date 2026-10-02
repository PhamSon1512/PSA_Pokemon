import type { Route } from './+types/media.batch-delete';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, ok } from '~/.server/response';
import { batchDeleteMedia } from '~/.server/services/media.service';

const BatchDeleteSchema = z.object({ ids: z.array(z.string()).min(1).max(100) });

// POST /api/media/batch-delete — batch delete media files by IDs
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  if (request.method !== 'POST') return badRequest('Method not allowed');

  const { env } = context.cloudflare;
  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  let body: { ids: string[] };
  try {
    body = BatchDeleteSchema.parse(await request.json());
  } catch {
    return badRequest('Body must be { ids: string[] } with 1–100 IDs');
  }

  const result = await batchDeleteMedia(getDb(context), env.STORAGE, body.ids, authUser.id, authUser.role);
  return ok(result);
});
