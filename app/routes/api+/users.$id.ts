import type { Route } from './+types/users.$id';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, forbidden, noContent, ok } from '~/.server/response';
import { getUserById, softDeleteUser, updateUser } from '~/.server/services/user.service';
import { parseBody } from '~/.server/validators';
import { UpdateUserBodySchema } from '~/openapi/auth-users.openapi';

// GET /api/users/:id — get user by ID
// Casbin allows: admin (wildcard), editor (users.read_self inherited via user), user (users.read_self)
// Ownership scope: non-admin can only read their own profile (enforced below)
export const loader = withErrorHandling(async ({ request, context, params }: Route.LoaderArgs) => {
  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  // Ownership check: non-admin can only read their own profile
  if (authUser.id !== params.id && authUser.role !== 'admin') return forbidden();

  const user = await getUserById(getDb(context), params.id);
  return ok(user);
});

// PATCH | PUT | DELETE /api/users/:id
export const action = withErrorHandling(async ({ request, context, params }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const authUser = await requireAuth(request, context);
  requirePermission(authUser, request);

  if (method === 'PATCH' || method === 'PUT') {
    // Ownership check: non-admin can only update their own profile
    if (authUser.id !== params.id && authUser.role !== 'admin') return forbidden();

    const body = await parseBody(request, UpdateUserBodySchema);
    const updated = await updateUser(getDb(context), params.id, body, authUser.role);
    return ok(updated);
  }

  if (method === 'DELETE') {
    // Block self-delete: no valid reason to delete yourself via API
    if (params.id === authUser.id) return badRequest('Cannot delete your own account');
    // Only admin can delete — enforced by Casbin (users.delete policy absent for editor/user)
    await softDeleteUser(getDb(context), params.id);
    return noContent();
  }

  return badRequest('Method not allowed');
});
