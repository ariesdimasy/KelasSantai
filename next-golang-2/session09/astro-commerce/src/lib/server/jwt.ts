/**
 * JWT (HS256) memakai `jose`.
 *
 * Token disimpan di cookie httpOnly — bukan localStorage — supaya:
 *  - tidak bisa dibaca JavaScript (aman dari XSS mencuri token),
 *  - otomatis terkirim saat SSR, jadi middleware bisa cek role sebelum render.
 *
 * Ketika endpoint auth sudah tersedia di fiber-api, cukup ganti isi
 * `signSession`/`verifySession` agar memakai token dari backend. Payload-nya
 * sengaja dibuat standar (sub, name, email, role) supaya kompatibel.
 */
import { SignJWT, jwtVerify } from 'jose';
import type { Role, SessionUser } from '@/lib/types';

export const SESSION_COOKIE = 'ac_token';

const DEFAULT_SECRET = 'astro-commerce-dev-secret-change-me-please';
const rawSecret = import.meta.env.AUTH_SECRET ?? DEFAULT_SECRET;

if (import.meta.env.PROD && rawSecret === DEFAULT_SECRET) {
  // Jangan sampai production jalan dengan secret contoh.
  throw new Error('AUTH_SECRET wajib diset di production (lihat .env.example)');
}

const secret = new TextEncoder().encode(rawSecret);

/** Umur token dalam detik (default 7 hari). */
export const TOKEN_TTL = Number(import.meta.env.AUTH_TOKEN_TTL ?? 604800) || 604800;

interface SessionClaims {
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setIssuer('astro-commerce')
    .setExpirationTime(`${TOKEN_TTL}s`)
    .sign(secret);
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<SessionClaims>(token, secret, {
      issuer: 'astro-commerce',
    });

    const id = Number(payload.sub);
    if (!Number.isFinite(id) || id <= 0) return null;
    if (payload.role !== 'admin' && payload.role !== 'user') return null;

    return {
      id,
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      role: payload.role,
    };
  } catch {
    // token kedaluwarsa / signature salah / bukan JWT
    return null;
  }
}
