import type { Route } from './+types/admin.roles';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth, requirePermission } from '~/.server/guard';
import { badRequest, created, ok } from '~/.server/response';
import { createRole, listRoles } from '~/.server/services/rbac.service';
import { parseBody } from '~/.server/validators';

const CreateRoleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/, 'slug must be lowercase alphanumeric with _ or -'),
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
  parentSlug: z.string().optional(),
});

// GET  /api/admin/roles — list all roles (admin only)
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  requirePermission(user, request);
  const data = await listRoles(getDb(context));
  return ok(data);
});

// POST /api/admin/roles — create role (admin only)
// PATCH | DELETE /api/admin/roles/:slug → handled by admin.roles.$slug.ts
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  const method = request.method.toUpperCase();

  const user = await requireAuth(request, context);
  requirePermission(user, request);

  if (method === 'POST') {
    const body = await parseBody(request, CreateRoleSchema);
    const role = await createRole(getDb(context), body);
    return created(role);
  }

  return badRequest('Method not allowed');
});
