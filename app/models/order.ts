import { createId } from '@paralleldrive/cuid2';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { products } from './product';
import { users } from './user';

export const orders = table('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  address: text('address'),
  note: text('note'),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0),
  shipping: integer('shipping').default(0),
  total: integer('total').notNull(),
  status: text('status', { enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
    .notNull()
    .default('PENDING'),
  paymentMethod: text('payment_method').default('COD'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
});

export const orderItems = table('order_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id),
  productId: text('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
});
