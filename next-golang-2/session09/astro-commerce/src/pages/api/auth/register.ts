/**
 * POST /api/auth/register — registrasi pelanggan baru (role selalu "user").
 * Role admin hanya bisa dibuat lewat /dashboard/users oleh admin lain.
 */
import type { APIRoute } from 'astro';
import { registerSchema } from '@/lib/schemas';
import { created, fail, readJson, setSessionCookie } from '@/lib/server/http';
import { ServiceError } from '@/lib/server/errors';
import { signSession } from '@/lib/server/jwt';
import { registerUser } from '@/lib/server/users';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await readJson(request);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw parsed.error;

    const user = await registerUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // Langsung login setelah registrasi berhasil
    setSessionCookie(cookies, await signSession(user));

    return created({ user }, 'Registrasi berhasil');
  } catch (error) {
    if (error instanceof ServiceError && error.status === 409) {
      return fail(new ServiceError(409, error.message, { email: error.message }));
    }
    return fail(error);
  }
};
