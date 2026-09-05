/**
 * POST   /api/products/:id/image — upload / ganti image produk (admin)
 * DELETE /api/products/:id/image — hapus image produk (admin)
 *
 * Satu produk hanya punya SATU image (mengikuti aturan di fiber-api:
 * kolom Product.Image cuma menampung satu path). POST dipakai untuk upload
 * maupun ganti — BFF yang memutuskan memakai POST atau PUT ke fiber-api.
 *
 * Body: multipart/form-data, field "image", maksimal 2 MB, jpg/png/webp.
 */
import type { APIRoute } from 'astro';
import { deleteProductImage, setProductImage } from '@/lib/server/catalog';
import { badRequest } from '@/lib/server/errors';
import { fail, ok, paramId, requireAdmin } from '@/lib/server/http';
import { validateImage } from '@/lib/server/uploads';

export const POST: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    const id = paramId(context);

    let form: FormData;
    try {
      form = await context.request.formData();
    } catch {
      throw badRequest('Body harus multipart/form-data');
    }

    const file = form.get('image');
    const validation = await validateImage(file);
    if (!validation.ok) throw badRequest(validation.error, { image: validation.error });

    const product = await setProductImage(id, file as File, validation.image);
    return ok(product, 'Image produk berhasil disimpan');
  } catch (error) {
    return fail(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    const product = await deleteProductImage(paramId(context));
    return ok(product, 'Image produk berhasil dihapus');
  } catch (error) {
    return fail(error);
  }
};
