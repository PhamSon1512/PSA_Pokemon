import type { Route } from './+types/admin.permissions.$id';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, noContent } from '~/.server/response';
import { deletePermission } from '~/.server/services/rbac.service';

// DELETE /api/admin/permissions/:id — delete a permission by id
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  if (method === 'DELETE') {
    if (!params.id) return badRequest('Permission id is required');
    await deletePermission(getDb(context), params.id);
    return noContent();
  }

  return badRequest('Method not allowed');
});
