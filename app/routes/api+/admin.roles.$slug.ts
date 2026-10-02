import type { Route } from './+types/admin.roles.$slug';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, noContent, ok } from '~/.server/response';
import { deleteRole, updateRole } from '~/.server/services/rbac.service';
import { parseBody } from '~/.server/validators';

const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(500).optional(),
  parentSlug: z.string().nullable().optional(),
});

// PATCH  /api/admin/roles/:slug — update role
// DELETE /api/admin/roles/:slug — delete role
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  if (method === 'PATCH' || method === 'PUT') {
    const body = await parseBody(request, UpdateRoleSchema);
    const updated = await updateRole(getDb(context), params.slug, body);
    return ok(updated);
  }

  if (method === 'DELETE') {
    await deleteRole(getDb(context), params.slug);
    return noContent();
  }

  return badRequest('Method not allowed');
});
