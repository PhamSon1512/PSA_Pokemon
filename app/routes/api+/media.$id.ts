import type { Route } from './+types/media.$id';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, forbidden, noContent, ok } from '~/.server/response';
import { deleteMedia, getMediaById, updateMedia } from '~/.server/services/media.service';
import { parseBody } from '~/.server/validators';
import { UpdateMediaBodySchema } from '~/openapi/media.openapi';

// GET /api/media/:id — get single media item (all authenticated roles)
export const loader = withErrorHandling(async ({ request, context, params }: Route.LoaderArgs) => {
  const { env } = context.cloudflare;

  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  const item = await getMediaById(getDb(context), env.R2_PUBLIC_URL, params.id);
  return ok(item);
});

// PATCH | PUT | DELETE /api/media/:id
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const { env } = context.cloudflare;
  const method = request.method.toUpperCase();

  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  // Fetch the item once to get ownership info — used for both PATCH and DELETE
  // This prevents relying solely on service-layer checks that could be silently removed.
  const item = await getMediaById(getDb(context), env.R2_PUBLIC_URL, params.id);

  if (method === 'PATCH' || method === 'PUT') {
    // Explicit ownership check: only uploader or admin may update
    if (item.createdBy !== authUser.id && authUser.role !== 'admin') return forbidden();

    const body = await parseBody(request, UpdateMediaBodySchema);
    const updated = await updateMedia(getDb(context), env.R2_PUBLIC_URL, params.id, body, authUser.id, authUser.role);
    return ok(updated);
  }

  if (method === 'DELETE') {
    // Explicit ownership check: only uploader or admin may delete
    // Casbin already restricts DELETE to editor+admin; this adds the ownership layer.
    if (item.createdBy !== authUser.id && authUser.role !== 'admin') return forbidden();

    await deleteMedia(getDb(context), env.STORAGE, params.id, authUser.id, authUser.role);
    return noContent();
  }

  return badRequest('Method not allowed');
});
