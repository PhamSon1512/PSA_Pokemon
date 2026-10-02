import type { Route } from './+types/admin.permissions';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, created, ok } from '~/.server/response';
import { createPermission, listPermissions } from '~/.server/services/rbac.service';
import { parseBody } from '~/.server/validators';
import { CreatePermissionBodySchema } from '~/openapi/rbac.openapi';

// GET  /api/admin/permissions  — list all permissions
// POST /api/admin/permissions  — create permission
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  requirePermission(user, request);
  const data = await listPermissions(getDb(context));
  return ok(data);
});

export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  if (method === 'POST') {
    const body = await parseBody(request, CreatePermissionBodySchema);
    const perm = await createPermission(getDb(context), body);
    return created(perm);
  }

  return badRequest('Method not allowed');
});
