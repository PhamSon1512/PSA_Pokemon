import type { Route } from './+types/auth.register';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { created } from '~/.server/response';
import { register } from '~/.server/services/auth.service';
import { parseBody } from '~/.server/validators';
import { RegisterBodySchema } from '~/openapi/auth-users.openapi';

// POST /api/auth/register
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  const { env } = context.cloudflare;
  const body = await parseBody(request, RegisterBodySchema);
  const result = await register(getDb(context), env.JWT_SECRET, body);
  return created(result);
});
