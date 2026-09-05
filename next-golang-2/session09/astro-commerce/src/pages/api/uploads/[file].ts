/**
 * GET /api/uploads/:file — melayani image produk yang tersimpan di store lokal
 * (`.data/uploads`). Image milik fiber-api tetap dilayani oleh fiber-api
 * lewat app.Static("/uploads", ...).
 *
 * `path.basename` wajib: tanpa itu, request ke
 * /api/uploads/..%2F..%2F.env bisa membaca file di luar folder upload.
 */
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_UPLOAD_DIR } from '@/lib/server/store';
import { imageContentType } from '@/lib/server/uploads';

export const GET: APIRoute = async ({ params }) => {
  const requested = params.file ?? '';
  const filename = path.basename(requested);

  if (!filename || filename !== requested) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const bytes = await readFile(path.join(LOCAL_UPLOAD_DIR, filename));
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': imageContentType(filename),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
