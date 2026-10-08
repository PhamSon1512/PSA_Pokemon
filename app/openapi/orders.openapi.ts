import { createRoute, z } from '@hono/zod-openapi';

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().nullable(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string().nullable(),
  customerName: z.string(),
  customerEmail: z.string().nullable(),
  customerPhone: z.string().nullable(),
  address: z.string().nullable(),
  note: z.string().nullable(),
  subtotal: z.number(),
  discount: z.number().nullable(),
  shipping: z.number().nullable(),
  total: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  paymentMethod: z.string().nullable(),
  paidAt: z.string().or(z.date()).nullable(),
  createdAt: z.string().or(z.date()),
});

export const OrderWithItemsSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema),
});

export const CreateOrderInput = z.object({
  customerName: z.string(),
  customerEmail: z.string().optional(),
  customerPhone: z.string(),
  address: z.string(),
  note: z.string().optional(),
  paymentMethod: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
});

export const createOrderRoute = createRoute({
  method: 'post',
  path: '/public/orders',
  request: {
    body: {
      content: { 'application/json': { schema: CreateOrderInput } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: OrderWithItemsSchema } },
      description: 'Created order',
    },
  },
});

export const adminListOrdersRoute = createRoute({
  method: 'get',
  path: '/admin/orders',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(OrderSchema) } },
      description: 'List of all orders',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminUpdateOrderStatusRoute = createRoute({
  method: 'put',
  path: '/admin/orders/{id}/status',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']) }) },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: OrderSchema } },
      description: 'Updated order status',
    },
  },
  security: [{ BearerAuth: [] }],
});
