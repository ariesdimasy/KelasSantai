/**
 * Middleware Astro — dijalankan untuk SETIAP request sebelum halaman dirender.
 *
 * Tugasnya dua:
 *  1. Verifikasi JWT dari cookie httpOnly, lalu simpan hasilnya di
 *     `Astro.locals.user` agar bisa dipakai halaman & API route.
 *  2. Menjaga protected route:
 *       /home /profile /checkout /orders  -> wajib login
 *       /dashboard/**                     -> wajib login DAN role admin
 *
 * Kenapa dicek di server, bukan di React? Karena cek di browser bisa
 * dilewati (matikan JS / edit state), dan HTML-nya sudah terkirim lebih dulu.
 */
import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySession } from '@/lib/server/jwt';

/** Route yang wajib login (prefix match). */
const AUTH_ROUTES = ['/home', '/profile', '/checkout', '/orders'];
/** Route yang wajib role admin. */
const ADMIN_ROUTES = ['/dashboard'];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifySession(token);

  context.locals.user = user;

  // Cookie ada tapi token tidak valid/kedaluwarsa -> bersihkan biar tidak
  // terus-terusan dikirim setiap request.
  if (token && !user) {
    context.cookies.delete(SESSION_COOKIE, { path: '/' });
  }

  const { pathname } = context.url;

  // API route menjaga dirinya sendiri lewat requireUser/requireAdmin,
  // supaya balasannya JSON 401/403, bukan redirect HTML.
  if (pathname.startsWith('/api/')) return next();

  const needsAdmin = matches(pathname, ADMIN_ROUTES);
  const needsAuth = needsAdmin || matches(pathname, AUTH_ROUTES);

  if (needsAuth && !user) {
    const redirectTo = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/signin?redirect=${redirectTo}`, 302);
  }

  if (needsAdmin && user?.role !== 'admin') {
    // Sudah login tapi bukan admin: arahkan ke area miliknya sendiri.
    return context.redirect('/home?error=admin-only', 302);
  }

  // Sudah login tapi membuka halaman auth -> tidak perlu login dua kali.
  if (user && (pathname === '/signin' || pathname === '/register')) {
    return context.redirect(user.role === 'admin' ? '/dashboard' : '/home', 302);
  }

  return next();
});
