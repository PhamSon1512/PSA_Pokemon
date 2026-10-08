import { createRoute, z } from '@hono/zod-openapi';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  comparePrice: z.number().nullable(),
  image: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  category: z.string().nullable(),
  badges: z.array(z.string()).nullable(),
  sold: z.number(),
  type: z.enum(['MYSTERY_BAG', 'NORMAL']),
  stock: z.number(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT']),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable(),
  deletedAt: z.string().or(z.date()).nullable(),
});

export const ProductCreateInput = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  sold: true,
});

export const ProductUpdateInput = ProductCreateInput.partial();

export const getPublicProductsRoute = createRoute({
  method: 'get',
  path: '/public/products',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(ProductSchema) } },
      description: 'List of active products',
    },
  },
});

export const getPublicProductBySlugRoute = createRoute({
  method: 'get',
  path: '/public/products/{slug}',
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ProductSchema } },
      description: 'Product details',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Not found',
    },
  },
});

export const adminListProductsRoute = createRoute({
  method: 'get',
  path: '/admin/products',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(ProductSchema) } },
      description: 'List of all products',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminCreateProductRoute = createRoute({
  method: 'post',
  path: '/admin/products',
  request: {
    body: {
      content: { 'application/json': { schema: ProductCreateInput } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: ProductSchema } },
      description: 'Created product',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminUpdateProductRoute = createRoute({
  method: 'put',
  path: '/admin/products/{id}',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: ProductUpdateInput } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ProductSchema } },
      description: 'Updated product',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminDeleteProductRoute = createRoute({
  method: 'delete',
  path: '/admin/products/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Deleted product',
    },
  },
  security: [{ BearerAuth: [] }],
});
