import type { Route } from './+types/settings';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAdmin, requireAuth } from '~/.server/guard';
import { badRequest, ok } from '~/.server/response';
import { getSiteSettings, updateSettings } from '~/.server/services/settings.service';

// GET /api/settings
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  requireAdmin(user);

  const db = getDb(context);
  const siteSettings = await getSiteSettings(db);
  return ok(siteSettings);
});

// PATCH /api/settings
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  if (request.method !== 'PATCH' && request.method !== 'PUT') return badRequest('Method not allowed');

  const user = await requireAuth(request, context);
  requireAdmin(user);

  const body = await request.json();
  const input = z
    .object({
      siteName: z.string().min(1).optional(),
      siteDescription: z.string().optional(),
      siteUrl: z.string().url().or(z.literal('')).optional(),
      adminEmail: z.string().email().or(z.literal('')).optional(),
      mediaOrganizeByDate: z.boolean().optional(),
    })
    .parse(body);

  const db = getDb(context);
  await updateSettings(db, input, 'general');
  const updated = await getSiteSettings(db);
  return ok(updated);
});
