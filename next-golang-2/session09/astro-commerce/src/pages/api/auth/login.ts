/**
 * POST /api/auth/login — tukar email+password dengan cookie JWT httpOnly.
 * Response menyertakan role supaya frontend tahu harus diarahkan ke
 * /dashboard (admin) atau /home (user).
 */
import type { APIRoute } from 'astro';
import { signInSchema } from '@/lib/schemas';
import { fail, ok, readJson, setSessionCookie } from '@/lib/server/http';
import { signSession } from '@/lib/server/jwt';
import { authenticate } from '@/lib/server/users';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await readJson(request);
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const user = await authenticate(parsed.data.email, parsed.data.password);
    setSessionCookie(cookies, await signSession(user));

    return ok({ user }, 'Login berhasil');
  } catch (error) {
    return fail(error);
  }
};
