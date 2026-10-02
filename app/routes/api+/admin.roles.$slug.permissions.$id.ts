import type { Route } from './+types/admin.roles.$slug.permissions.$id';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, noContent } from '~/.server/response';
import { revokePermission } from '~/.server/services/rbac.service';

// DELETE /api/admin/roles/:slug/permissions/:id  — revoke permission from role
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  if (method !== 'DELETE') return badRequest('Method not allowed');

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  const { slug, id } = params;
  if (!id) return badRequest('permissionId is required');

  await revokePermission(getDb(context), slug, id);
  return noContent();
});
