import type { Route } from './+types/admin.seed';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAdmin, requireAuth } from '~/.server/guard';
import { badRequest, ok } from '~/.server/response';
import { seedRbac } from '~/.server/services/rbac.service';

// POST /api/admin/seed — run seedRbac() from UI (admin only)
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  if (request.method !== 'POST') return badRequest('Method not allowed');

  // Bootstrap route — role check only, Casbin policies may not be seeded yet.
  const user = await requireAuth(request, context);
  requireAdmin(user);

  await seedRbac(getDb(context));
  return ok({ message: 'Default roles and permissions seeded' });
});
