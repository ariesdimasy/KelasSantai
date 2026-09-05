/**
 * Helper response + guard untuk Astro API routes (src/pages/api/**).
 * Bentuk envelope-nya sengaja sama dengan fiber-api
 * ({ success, message, data, error, errors, meta }) supaya kode di sisi
 * browser tidak perlu tahu siapa yang melayani request-nya.
 */
import type { APIContext, AstroCookies } from 'astro';
import { z } from 'zod';
import type { ApiEnvelope, PaginationMeta, SessionUser } from '@/lib/types';
import { fieldErrors } from '@/lib/schemas';
import { SESSION_COOKIE, TOKEN_TTL } from './jwt';
import { ServiceError, forbidden, unauthorized } from './errors';

export function json<T>(body: ApiEnvelope<T>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // data user/keranjang tidak boleh di-cache proxy
      'Cache-Control': 'no-store',
    },
  });
}

export function ok<T>(
  data: T,
  message?: string,
  extra?: { meta?: PaginationMeta; warning?: string },
): Response {
  return json({ success: true, message, data, ...extra });
}

export function created<T>(data: T, message?: string): Response {
  return json({ success: true, message, data }, 201);
}

export function noContent(message: string): Response {
  return json({ success: true, message });
}

/**
 * Ubah error apa pun menjadi response JSON yang rapi.
 * Dipakai di blok catch setiap API route.
 */
export function fail(error: unknown): Response {
  if (error instanceof ServiceError) {
    return json({ success: false, error: error.message, errors: error.errors }, error.status);
  }
  if (error instanceof z.ZodError) {
    return json({ success: false, error: 'Validasi gagal', errors: fieldErrors(error) }, 400);
  }

  console.error('[api] unhandled error:', error);
  return json({ success: false, error: 'Terjadi kesalahan internal' }, 500);
}

/** Body JSON yang wajib ada dan valid. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ServiceError(400, 'Format JSON tidak valid');
  }
}

/** Pastikan sudah login. Dipakai di route yang butuh session. */
export function requireUser(context: APIContext): SessionUser {
  const user = context.locals.user;
  if (!user) throw unauthorized();
  return user;
}

/** Pastikan login DAN role admin (dashboard). */
export function requireAdmin(context: APIContext): SessionUser {
  const user = requireUser(context);
  if (user.role !== 'admin') throw forbidden('Halaman ini hanya untuk admin');
  return user;
}

/** Ambil ID dari path param dan pastikan angka positif. */
export function paramId(context: APIContext): number {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError(400, 'ID harus berupa angka');
  }
  return id;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: import.meta.env.PROD,
} as const;

export function setSessionCookie(cookies: AstroCookies, token: string): void {
  cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: TOKEN_TTL });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
