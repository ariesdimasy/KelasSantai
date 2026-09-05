/**
 * GET  /api/categories?with_count=1 — daftar kategori (publik, untuk filter)
 * POST /api/categories              — buat kategori (admin)
 */
import type { APIRoute } from 'astro';
import { categorySchema } from '@/lib/schemas';
import { createCategory, listCategories } from '@/lib/server/catalog';
import { created, fail, ok, readJson, requireAdmin } from '@/lib/server/http';

export const GET: APIRoute = async ({ url }) => {
  try {
    const withCount = url.searchParams.get('with_count') === '1';
    const result = await listCategories({ withCount });
    return ok(result.data, 'Data kategori', { warning: result.warning });
  } catch (error) {
    return fail(error);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const category = await createCategory(parsed.data);
    return created(category, 'Kategori berhasil dibuat');
  } catch (error) {
    return fail(error);
  }
};
