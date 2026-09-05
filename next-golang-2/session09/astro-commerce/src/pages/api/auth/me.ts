/**
 * GET  /api/auth/me — data user yang sedang login (null bila guest).
 * PUT  /api/auth/me — ubah profil sendiri (nama, email, password).
 *
 * Role TIDAK bisa diubah dari sini — kalau bisa, user biasa cukup memanggil
 * endpoint ini untuk menjadikan dirinya admin.
 */
import type { APIRoute } from 'astro';
import { profileSchema } from '@/lib/schemas';
import { fail, ok, readJson, requireUser, setSessionCookie } from '@/lib/server/http';
import { signSession } from '@/lib/server/jwt';
import { toSessionUser, updateUser } from '@/lib/server/users';

export const GET: APIRoute = async (context) => {
  return ok({ user: context.locals.user });
};

export const PUT: APIRoute = async (context) => {
  try {
    const session = requireUser(context);
    const body = await readJson(context.request);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const user = await updateUser(session.id, {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      // role sengaja tidak diambil dari body
    });

    // Nama/email berubah -> token lama masih berisi data lama, jadi diperbarui.
    setSessionCookie(context.cookies, await signSession(toSessionUser(user)));

    return ok({ user }, 'Profil berhasil diperbarui');
  } catch (error) {
    return fail(error);
  }
};
