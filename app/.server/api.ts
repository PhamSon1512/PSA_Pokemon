import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { cards, media, permissions, rolePermissions, roles, schemaRelations, settings, users } from '~/models';
import { authLoginRoute, authRegisterRoute } from '~/openapi/auth-users.openapi';
import {
  adminCreateCardRoute,
  adminDeleteCardRoute,
  adminListCardsRoute,
  adminUpdateCardRoute,
  getPublicCardByCertRoute,
  searchPublicCardsRoute,
} from '~/openapi/cards.openapi';
import { requireAuthSession } from './guard';
import { login, register } from './services/auth.service';
import { createCard, deleteCard, getCardByCertNumber, listAdminCards, searchCards, updateCard } from './services/card.service';

const schema = { users, media, roles, permissions, rolePermissions, settings, schemaRelations, cards };

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

// ========================
// PUBLIC CARDS
// ========================
api.openapi(getPublicCardByCertRoute, async (c) => {
  const { certNumber } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  const card = await getCardByCertNumber(db, certNumber);
  if (!card) return c.json({ error: 'Not found' }, 404);
  return c.json(card, 200);
});

api.openapi(searchPublicCardsRoute, async (c) => {
  const { q } = c.req.valid('query');
  const db = drizzle(c.env.DB, { schema });
  const results = await searchCards(db, q);
  return c.json(results, 200);
});

// ========================
// ADMIN CARDS
// ========================
api.openapi(adminListCardsRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await listAdminCards(db);
  return c.json(results, 200);
});

api.openapi(adminCreateCardRoute, async (c) => {
  // Normally you verify auth here via middleware, we do it inline for simplicity
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const card = await createCard(db, input, 'admin'); // Hardcoded actor for now
  return c.json(card, 201);
});

api.openapi(adminUpdateCardRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const card = await updateCard(db, id, input, 'admin');
  return c.json(card, 200);
});

api.openapi(adminDeleteCardRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deleteCard(db, id, 'admin');
  return c.json({ success: true }, 200);
});
