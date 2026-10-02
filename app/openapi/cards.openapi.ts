import { createRoute, z } from '@hono/zod-openapi';

// Basic Card Schema
export const CardSchema = z.object({
  id: z.string(),
  certNumber: z.string(),
  cardName: z.string(),
  frontImage: z.string().nullable(),
  backImage: z.string().nullable(),
  itemGrade: z.string().nullable(),
  labelType: z.string().nullable(),
  reverseCertBarcode: z.string().nullable(),
  year: z.string().nullable(),
  brandTitle: z.string().nullable(),
  subject: z.string().nullable(),
  cardNumber: z.string().nullable(),
  category: z.string().nullable(),
  varietyPedigree: z.string().nullable(),
  psaEstimate: z.string().nullable(),
  psaPopulation: z.number().nullable(),
  psaPopHigher: z.number().nullable(),
  status: z.enum(['PENDING', 'APPROVED', 'ACTIVE', 'INACTIVE']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable(),
});

export const CardCreateInput = CardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Can be partial or not
});

export const CardUpdateInput = CardCreateInput.partial();

// ========================
// PUBLIC ROUTES
// ========================

export const getPublicCardByCertRoute = createRoute({
  method: 'get',
  path: '/public/cards/{certNumber}',
  request: {
    params: z.object({ certNumber: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: CardSchema } },
      description: 'Card details',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Not found',
    },
  },
});

export const searchPublicCardsRoute = createRoute({
  method: 'get',
  path: '/public/cards/search',
  request: {
    query: z.object({
      q: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(CardSchema) } },
      description: 'List of matching cards',
    },
  },
});

// ========================
// ADMIN ROUTES
// ========================

export const adminListCardsRoute = createRoute({
  method: 'get',
  path: '/admin/cards',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(CardSchema) } },
      description: 'List of all cards for admin',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminCreateCardRoute = createRoute({
  method: 'post',
  path: '/admin/cards',
  request: {
    body: {
      content: { 'application/json': { schema: CardCreateInput } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: CardSchema } },
      description: 'Created card',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminUpdateCardRoute = createRoute({
  method: 'put',
  path: '/admin/cards/{id}',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: CardUpdateInput } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: CardSchema } },
      description: 'Updated card',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminDeleteCardRoute = createRoute({
  method: 'delete',
  path: '/admin/cards/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Deleted card',
    },
  },
  security: [{ BearerAuth: [] }],
});
