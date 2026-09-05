/**
 * GET  /api/orders — riwayat order milik user yang login (admin: semua order)
 * POST /api/orders — checkout
 */
import type { APIRoute } from 'astro';
import { checkoutSchema } from '@/lib/schemas';
import { created, fail, ok, readJson, requireUser } from '@/lib/server/http';
import { createOrder, listOrders } from '@/lib/server/orders';

export const GET: APIRoute = async (context) => {
  try {
    const user = requireUser(context);
    const orders = await listOrders(user.role === 'admin' ? undefined : user.id);
    return ok(orders, 'Riwayat pesanan');
  } catch (error) {
    return fail(error);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const user = requireUser(context);

    const body = await readJson(context.request);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const order = await createOrder(user, parsed.data);
    return created(order, 'Pesanan berhasil dibuat');
  } catch (error) {
    return fail(error);
  }
};
