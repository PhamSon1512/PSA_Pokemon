import { desc, eq } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { orderItems, orders } from '~/models/order';

export async function createOrder(db: DrizzleD1Database<any>, data: any) {
  const orderNumber =
    'ORD' +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  let subtotal = 0;
  for (const item of data.items) {
    subtotal += item.price * item.quantity;
  }
  const total = subtotal + (data.shipping || 0) - (data.discount || 0);

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address: data.address,
      note: data.note,
      subtotal,
      discount: data.discount,
      shipping: data.shipping,
      total,
      paymentMethod: data.paymentMethod,
    })
    .returning();

  for (const item of data.items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
    });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  // TODO: Configure email service here
  // (e.g. use nodemailer with SMTP app password to send email to data.customerEmail)

  return { ...order, items };
}

export async function listAdminOrders(db: DrizzleD1Database<any>) {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(db: DrizzleD1Database<any>, id: string, status: string) {
  const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  return order;
}
