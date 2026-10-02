import type { Route } from './+types/admin.sync';
import { getDb } from '~/.server/db';
import { discoverRoutes, getMissingRoutes } from '~/.server/discover-routes';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAdmin, requireAuth } from '~/.server/guard';
import { badRequest, ok } from '~/.server/response';
import { createPermission, listPermissions } from '~/.server/services/rbac.service';

// POST /api/admin/sync — sync discovered routes into permissions table (admin only)
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  if (request.method !== 'POST') return badRequest('Method not allowed');

  // Bootstrap route — use role check instead of Casbin RBAC.
  // requirePermission would fail here because this permission may not exist in DB yet.
  const user = await requireAuth(request, context);
  requireAdmin(user);

  const db = getDb(context);
  const discovered = discoverRoutes();
  const existing = await listPermissions(db);
  const missing = getMissingRoutes(discovered, existing);

  const results = await Promise.allSettled(
    missing.map(({ resource, action, description }) => createPermission(db, { resource, action, description })),
  );

  const synced = results.filter((r) => r.status === 'fulfilled').length;

  return ok({ synced, total: missing.length, message: `Synced ${synced} new permissions from routes` });
});
