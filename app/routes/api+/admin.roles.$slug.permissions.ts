import type { Route } from './+types/admin.roles.$slug.permissions';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, created, ok } from '~/.server/response';
import { assignPermission, getRolePermissions } from '~/.server/services/rbac.service';
import { parseBody } from '~/.server/validators';

const AssignSchema = z.object({
  permissionId: z.string().min(1),
});

// GET  /api/admin/roles/:slug/permissions     — list permissions for a role
// POST /api/admin/roles/:slug/permissions     — assign permission to role
// DELETE is handled by: admin.roles.$slug.permissions.$id.ts
export const loader = withErrorHandling(async ({ request, context, params }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  requirePermission(user, request);
  const data = await getRolePermissions(getDb(context), params.slug);
  return ok(data);
});

// POST /api/admin/roles/:slug/permissions — assign permission to role
// DELETE is handled by admin.roles.$slug.permissions.$id.ts
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  if (method === 'POST') {
    const body = await parseBody(request, AssignSchema);
    await assignPermission(getDb(context), params.slug, body.permissionId);
    return created({ roleSlug: params.slug, permissionId: body.permissionId });
  }

  return badRequest('Method not allowed');
});
