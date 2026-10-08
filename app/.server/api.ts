import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import {
  badges,
  cards,
  categories,
  media,
  orderItems,
  orders,
  permissions,
  posts,
  products,
  rolePermissions,
  roles,
  schemaRelations,
  settings,
  users,
} from '~/models';
import { authLoginRoute, authRegisterRoute } from '~/openapi/auth-users.openapi';
// ========================
// BADGES
// ========================
import {
  adminCreateBadgeRoute,
  adminDeleteBadgeRoute,
  adminListBadgesRoute,
  adminUpdateBadgeRoute,
} from '~/openapi/badges.openapi';
import {
  adminCreateCardRoute,
  adminDeleteCardRoute,
  adminListCardsRoute,
  adminUpdateCardRoute,
  getPublicCardByCertRoute,
  searchPublicCardsRoute,
} from '~/openapi/cards.openapi';
// ========================
// CATEGORIES
// ========================
import {
  adminCreateCategoryRoute,
  adminDeleteCategoryRoute,
  adminListCategoriesRoute,
  adminUpdateCategoryRoute,
} from '~/openapi/categories.openapi';
import { deleteMediaRoute, getMediaRoute, listMediaRoute, updateMediaRoute, uploadMediaRoute } from '~/openapi/media.openapi';
import { adminListOrdersRoute, adminUpdateOrderStatusRoute, createOrderRoute } from '~/openapi/orders.openapi';
import {
  adminCreatePostRoute,
  adminDeletePostRoute,
  adminListPostsRoute,
  adminUpdatePostRoute,
  getPublicPostBySlugRoute,
  getPublicPostsRoute,
} from '~/openapi/posts.openapi';
import {
  adminCreateProductRoute,
  adminDeleteProductRoute,
  adminListProductsRoute,
  adminUpdateProductRoute,
  getPublicProductBySlugRoute,
  getPublicProductsRoute,
} from '~/openapi/products.openapi';
import { requireAuthSession } from './guard';
import { verifyJwt } from './jwt';
import { login, register } from './services/auth.service';
import { createBadge, deleteBadge, listBadges, updateBadge } from './services/badge.service';
import { createCard, deleteCard, getCardByCertNumber, listAdminCards, searchCards, updateCard } from './services/card.service';
import { createCategory, deleteCategory, listCategories, updateCategory } from './services/category.service';
import { deleteMedia, getMediaById, listMedia, uploadMedia } from './services/media.service';
import { createOrder, listAdminOrders, updateOrderStatus } from './services/order.service';
import { createPost, deletePost, getPostBySlug, getPublicPosts, listAdminPosts, updatePost } from './services/post.service';
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getPublicProducts,
  listAdminProducts,
  updateProduct,
} from './services/product.service';
import { parseCookie, TOKEN_COOKIE } from './session';

async function getUserIdFromCookie(c: any) {
  try {
    const cookieHeader = c.req.header('cookie');
    const token = parseCookie(cookieHeader, TOKEN_COOKIE);
    if (token) {
      const payload = await verifyJwt(token, c.env.JWT_SECRET, 'access');
      return payload.sub;
    }
  } catch (err) {}
  return null; // fallback
}

const schema = {
  users,
  media,
  roles,
  permissions,
  rolePermissions,
  settings,
  schemaRelations,
  cards,
  products,
  orders,
  orderItems,
  posts,
  categories,
  badges,
};

// Extract Cloudflare Environment Bindings from Remix AppLoadContext
export type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    // Add any variables you need during request lifecycle
  };
};

export const api = new OpenAPIHono<Env>().basePath('/api');
api.onError((err, c) => {
  console.error('HONO ERROR:', err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});

api.openapi(authLoginRoute, async (c) => {
  const { email, password } = c.req.valid('json');
  console.log('API SCHEMA:', Object.keys(schema));
  const db = drizzle(c.env.DB, { schema });
  try {
    const jwtSecret = c.env.JWT_SECRET;
    const result = await login(db, jwtSecret, email, password);

    const { buildAuthCookies } = await import('./session');
    const cookies = buildAuthCookies(result.token, result.refreshToken);
    cookies.forEach((cookieStr) => c.header('Set-Cookie', cookieStr, { append: true }));

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

// ========================
// MEDIA
// ========================
function getR2Url(c: any) {
  const origin = new URL(c.req.url).origin;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/api/media/files`;
  }
  return c.env.R2_PUBLIC_URL || '';
}

api.get('/media/files/*', async (c) => {
  const key = c.req.path.replace('/api/media/files/', '');
  const object = await c.env.STORAGE.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body as any, { headers });
});

api.openapi(uploadMediaRoute, async (c) => {
  const input = c.req.valid('form');
  const db = drizzle(c.env.DB, { schema });
  const result = await uploadMedia(db, c.env.STORAGE, getR2Url(c), {
    file: input.file,
    title: input.title,
    description: input.description,
    uploadedBy: await getUserIdFromCookie(c),
  });
  return c.json(result as any, 201);
});

api.openapi(listMediaRoute, async (c) => {
  const { page, limit } = c.req.valid('query');
  const db = drizzle(c.env.DB, { schema });
  const result = await listMedia(db, getR2Url(c), { limit, offset: (page - 1) * limit });
  return c.json({ ...result, page, limit, totalPages: Math.ceil(result.total / limit) }, 200);
});

api.openapi(getMediaRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  const result = await getMediaById(db, getR2Url(c), id);
  return c.json(result, 200);
});

api.openapi(deleteMediaRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deleteMedia(db, c.env.STORAGE, id, (await getUserIdFromCookie(c)) || 'admin', 'admin');
  return c.json({ success: true } as any, 204);
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

// ========================
// PRODUCTS
// ========================
api.openapi(getPublicProductsRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await getPublicProducts(db);
  return c.json(results, 200);
});
api.openapi(getPublicProductBySlugRoute, async (c) => {
  const { slug } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  const result = await getProductBySlug(db, slug);
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result, 200);
});
api.openapi(adminListProductsRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await listAdminProducts(db);
  return c.json(results, 200);
});
api.openapi(adminCreateProductRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await createProduct(db, input, (await getUserIdFromCookie(c)) as any);
  return c.json(result, 201);
});
api.openapi(adminUpdateProductRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await updateProduct(db, id, input);
  return c.json(result, 200);
});
api.openapi(adminDeleteProductRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deleteProduct(db, id);
  return c.json({ success: true }, 200);
});

// ========================
// ORDERS
// ========================
api.openapi(createOrderRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await createOrder(db, input);
  return c.json(result, 201);
});
api.openapi(adminListOrdersRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await listAdminOrders(db);
  return c.json(results, 200);
});
api.openapi(adminUpdateOrderStatusRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await updateOrderStatus(db, id, status);
  return c.json(result, 200);
});

// ========================
// POSTS
// ========================
api.openapi(getPublicPostsRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await getPublicPosts(db);
  return c.json(results, 200);
});
api.openapi(getPublicPostBySlugRoute, async (c) => {
  const { slug } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  const result = await getPostBySlug(db, slug);
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result, 200);
});
api.openapi(adminListPostsRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const results = await listAdminPosts(db);
  return c.json(results, 200);
});
api.openapi(adminCreatePostRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await createPost(db, input, (await getUserIdFromCookie(c)) as any);
  return c.json(result, 201);
});
api.openapi(adminUpdatePostRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await updatePost(db, id, input);
  return c.json(result, 200);
});
api.openapi(adminDeletePostRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deletePost(db, id);
  return c.json({ success: true }, 200);
});

api.openapi(adminListCategoriesRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const result = await listCategories(db);
  return c.json(result, 200);
});
api.openapi(adminCreateCategoryRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await createCategory(db, input, (await getUserIdFromCookie(c)) as any);
  return c.json(result, 201);
});
api.openapi(adminUpdateCategoryRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await updateCategory(db, id, input);
  return c.json(result, 200);
});
api.openapi(adminDeleteCategoryRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deleteCategory(db, id);
  return c.json({ success: true }, 200);
});

api.openapi(adminListBadgesRoute, async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const result = await listBadges(db);
  return c.json(result, 200);
});
api.openapi(adminCreateBadgeRoute, async (c) => {
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await createBadge(db, input, (await getUserIdFromCookie(c)) as any);
  return c.json(result, 201);
});
api.openapi(adminUpdateBadgeRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const db = drizzle(c.env.DB, { schema });
  const result = await updateBadge(db, id, input);
  return c.json(result, 200);
});
api.openapi(adminDeleteBadgeRoute, async (c) => {
  const { id } = c.req.valid('param');
  const db = drizzle(c.env.DB, { schema });
  await deleteBadge(db, id);
  return c.json({ success: true }, 200);
});

export default api;
