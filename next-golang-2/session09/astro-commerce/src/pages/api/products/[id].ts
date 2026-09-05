/**
 * GET    /api/products/:id — detail produk (publik)
 * PUT    /api/products/:id — ubah produk (admin)
 * DELETE /api/products/:id — hapus produk (admin)
 */
import type { APIRoute } from 'astro';
import { productSchema } from '@/lib/schemas';
import { deleteProduct, getProduct, updateProduct } from '@/lib/server/catalog';
import { fail, noContent, ok, paramId, readJson, requireAdmin } from '@/lib/server/http';
import { notFound } from '@/lib/server/errors';

export const GET: APIRoute = async (context) => {
  try {
    const product = await getProduct(paramId(context));
    if (!product) throw notFound('Produk tidak ditemukan');
    return ok(product, 'Data ditemukan');
  } catch (error) {
    return fail(error);
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const product = await updateProduct(paramId(context), parsed.data);
    return ok(product, 'Produk berhasil diperbarui');
  } catch (error) {
    return fail(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    await deleteProduct(paramId(context));
    return noContent('Produk berhasil dihapus');
  } catch (error) {
    return fail(error);
  }
};
