/**
 * PUT    /api/categories/:id — ubah kategori (admin)
 * DELETE /api/categories/:id — hapus kategori (admin, ditolak bila masih dipakai produk)
 */
import type { APIRoute } from 'astro';
import { categorySchema } from '@/lib/schemas';
import { deleteCategory, updateCategory } from '@/lib/server/catalog';
import { fail, noContent, ok, paramId, readJson, requireAdmin } from '@/lib/server/http';

export const PUT: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const category = await updateCategory(paramId(context), parsed.data);
    return ok(category, 'Kategori berhasil diperbarui');
  } catch (error) {
    return fail(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    await deleteCategory(paramId(context));
    return noContent('Kategori berhasil dihapus');
  } catch (error) {
    return fail(error);
  }
};
