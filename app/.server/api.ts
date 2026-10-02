import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { media, permissions, rolePermissions, roles, schemaRelations, settings, users } from '~/models';
import { authLoginRoute, authRegisterRoute } from '~/openapi/auth-users.openapi';
import { login, register } from './services/auth.service';

const schema = { users, media, roles, permissions, rolePermissions, settings, schemaRelations };

// Extract Cloudflare Environment Bindings from Remix AppLoadContext
export type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    // Add any variables you need during request lifecycle
  };
};

export const api = new OpenAPIHono<Env>();

api.openapi(authLoginRoute, async (c) => {
  const { email, password } = c.req.valid('json');
  console.log('API SCHEMA:', Object.keys(schema));
  const db = drizzle(c.env.DB, { schema });
  try {
    const jwtSecret = c.env.JWT_SECRET;
    const result = await login(db, jwtSecret, email, password);

    return c.json(
      {
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      },
      200,
    );
  } catch (err: any) {
    console.error('LOGIN ERROR:', err);
    return c.json({ error: err.message, stack: err.stack, schemaKeys: Object.keys(schema) }, 500);
  }
});

api.openapi(authRegisterRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const jwtSecret = c.env.JWT_SECRET;

  try {
    const result = await register(db, jwtSecret, input);
    return c.json(result.user, 201);
  } catch (err: any) {
    console.error('REGISTER ERROR:', err);
    const status = err?.statusCode ?? 500;
    return c.json({ error: { message: err.message, code: err.code ?? 'INTERNAL_ERROR' } }, status);
  }
});
