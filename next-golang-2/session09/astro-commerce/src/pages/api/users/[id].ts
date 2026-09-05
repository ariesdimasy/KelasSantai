/**
 * GET    /api/users/:id — detail user (admin)
 * PUT    /api/users/:id — ubah user termasuk role (admin)
 * DELETE /api/users/:id — hapus user (admin, tidak boleh akun sendiri)
 */
import type { APIRoute } from 'astro';
import { userUpdateSchema } from '@/lib/schemas';
import { notFound } from '@/lib/server/errors';
import { fail, noContent, ok, paramId, readJson, requireAdmin } from '@/lib/server/http';
import { deleteUser, getUser, updateUser } from '@/lib/server/users';

export const GET: APIRoute = async (context) => {
  try {
    requireAdmin(context);
    const user = await getUser(paramId(context));
    if (!user) throw notFound('User tidak ditemukan');
    return ok(user, 'Data ditemukan');
  } catch (error) {
    return fail(error);
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    requireAdmin(context);

    const body = await readJson(context.request);
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const user = await updateUser(paramId(context), parsed.data);
    return ok(user, 'User berhasil diperbarui');
  } catch (error) {
    return fail(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const admin = requireAdmin(context);
    await deleteUser(paramId(context), admin.id);
    return noContent('User berhasil dihapus');
  } catch (error) {
    return fail(error);
  }
};
