/**
 * Service order (hasil checkout).
 *
 * fiber-api belum punya model Order, jadi order disimpan di store lokal.
 * Catatan penting: harga TIDAK diambil dari body request. Harga & stok selalu
 * dibaca ulang dari katalog — kalau tidak, siapa pun bisa checkout dengan
 * mengirim price: 1 dari devtools.
 *
 * Stok sengaja TIDAK dikurangi di sini. Pengurangan stok harus atomik bersama
 * pembuatan order dalam satu transaksi database — itu tugas fiber-api
 * (lihat contoh transaksi di handlers/product_handler.go: CreateCategoryAndProduct).
 */
import type { CheckoutInput } from '@/lib/schemas';
import type { Order, OrderItem, SessionUser } from '@/lib/types';
import { badRequest, notFound } from './errors';
import { getProduct } from './catalog';
import { getDb, mutateDb, nextId } from './store';

/** Ongkir flat, gratis untuk belanja di atas 500 ribu. */
export const FREE_SHIPPING_THRESHOLD = 500_000;
export const SHIPPING_COST = 20_000;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export async function createOrder(
  user: SessionUser,
  input: CheckoutInput & { items: Array<{ productId: number; quantity: number }> },
): Promise<Order> {
  const items: OrderItem[] = [];

  for (const line of input.items) {
    const product = await getProduct(Number(line.productId));
    if (!product) throw notFound(`Produk #${line.productId} sudah tidak tersedia`);
    if (!product.isActive) throw badRequest(`Produk "${product.name}" sedang tidak dijual`);

    const quantity = Number(line.quantity);
    if (product.stock < quantity) {
      throw badRequest(`Stok "${product.name}" tinggal ${product.stock}`);
    }

    items.push({
      productId: product.id,
      name: product.name,
      price: product.price, // harga dari server, bukan dari client
      quantity,
      imageUrl: product.imageUrl,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = calculateShipping(subtotal);

  return mutateDb((db) => {
    const id = nextId(db, 'order');
    const createdAt = new Date();
    const order: Order = {
      id,
      code: `INV/${createdAt.getFullYear()}/${String(id).padStart(5, '0')}`,
      userId: user.id,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: input.paymentMethod === 'cod' ? 'pending' : 'paid',
      recipient: {
        name: input.name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        postalCode: input.postalCode,
        note: input.note ?? '',
      },
      paymentMethod: input.paymentMethod,
      createdAt: createdAt.toISOString(),
    };

    db.orders.push(order);
    return order;
  });
}

/** Order milik satu user (storefront). Tanpa userId = semua order (dashboard). */
export async function listOrders(userId?: number): Promise<Order[]> {
  const db = await getDb();
  return db.orders
    .filter((order) => userId === undefined || order.userId === userId)
    .sort((a, b) => b.id - a.id);
}

export async function getOrder(id: number, userId?: number): Promise<Order | null> {
  const orders = await listOrders(userId);
  return orders.find((order) => order.id === id) ?? null;
}
