/**
 * GET  /api/users?keyword= — daftar user (admin)
 * POST /api/users          — buat user, role bisa dipilih (admin)
 */
import type { APIRoute } from 'astro';
import { userCreateSchema } from '@/lib/schemas';
import { created, fail, ok, readJson, requireAdmin } from '@/lib/server/http';
import { createUser, listUsers } from '@/lib/server/users';

export const GET: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    const keyword = context.url.searchParams.get('keyword') ?? '';
    return ok(await listUsers(keyword), 'Data user');
  } catch (error) {
    return fail(error);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const user = await createUser(parsed.data);
    return created(user, 'User berhasil dibuat');
  } catch (error) {
    return fail(error);
  }
};
