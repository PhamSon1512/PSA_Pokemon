import type { Route } from './+types/users';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, ok, parsePagination } from '~/.server/response';
import { listUsers } from '~/.server/services/user.service';

// GET /api/users — list all users (admin only via Casbin policy)
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  requirePermission(user, request);

  const { page, limit, offset } = parsePagination(request.url);
  const { data, total } = await listUsers(getDb(context), { limit, offset });
  return ok(data, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

// POST /api/users — not supported, use /api/auth/register
// Return immediately — no auth round-trip needed for a static rejection
export const action = withErrorHandling(async ({ request }: Route.ActionArgs) => {
  if (request.method !== 'POST') return badRequest('Method not allowed');
  return badRequest('Use POST /api/auth/register to create users');
});
