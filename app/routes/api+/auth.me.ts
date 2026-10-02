import type { Route } from './+types/auth.me';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { requireAuth } from '~/.server/guard';
import { ok } from '~/.server/response';
import { getMe } from '~/.server/services/auth.service';

// GET /api/auth/me — returns current authenticated user info
export const loader = withErrorHandling(async ({ request, context }: Route.LoaderArgs) => {
  const user = await requireAuth(request, context);
  const profile = await getMe(getDb(context), user.id);
  return ok(profile);
});
