/**
 * GET  /api/products  — daftar produk (query: keyword, category_id, page, limit, sort)
 * POST /api/products  — buat produk baru (admin)
 *
 * GET boleh diakses guest (storefront), POST hanya admin.
 */
import type { APIRoute } from 'astro';
import { productSchema } from '@/lib/schemas';
import { createProduct, listProducts } from '@/lib/server/catalog';
import { created, fail, ok, readJson, requireAdmin } from '@/lib/server/http';
import type { ProductQuery } from '@/lib/types';

function parseQuery(url: URL): ProductQuery {
  const sort = url.searchParams.get('sort');
  return {
    keyword: url.searchParams.get('keyword') ?? '',
    categoryId: Number(url.searchParams.get('category_id') ?? 0) || 0,
    page: Number(url.searchParams.get('page') ?? 1) || 1,
    limit: Number(url.searchParams.get('limit') ?? 12) || 12,
    sort:
      sort === 'price-asc' || sort === 'price-desc' || sort === 'name-asc' ? sort : 'newest',
  };
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const result = await listProducts(parseQuery(url));
    return ok(result.data, 'Data produk', { meta: result.meta, warning: result.warning });
  } catch (error) {
    return fail(error);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const product = await createProduct(parsed.data);
    return created(product, 'Produk berhasil dibuat');
  } catch (error) {
    return fail(error);
  }
};
