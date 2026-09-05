/** POST /api/auth/logout — hapus cookie session. */
import type { APIRoute } from 'astro';
import { clearSessionCookie, noContent } from '@/lib/server/http';

export const POST: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return noContent('Anda sudah logout');
};
