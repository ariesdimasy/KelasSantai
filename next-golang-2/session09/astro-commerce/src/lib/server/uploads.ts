/**
 * Validasi & penyimpanan file upload untuk produk lokal.
 * Aturannya disamakan dengan fiber-api/helpers/upload.go:
 *   - maksimal 2 MB
 *   - hanya jpg/jpeg/png/webp
 *   - isi file dicek lewat magic bytes, bukan cuma ekstensi/Content-Type
 *     (ekstensi mudah dipalsukan)
 */
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_UPLOAD_DIR } from './store';

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/** Prefix penanda file yang disimpan di store lokal (bukan di fiber-api). */
export const LOCAL_IMAGE_PREFIX = 'local:';

function detectMime(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WEBP: "RIFF" .... "WEBP"
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...Array.from(bytes.slice(start, end)));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';

  return null;
}

export interface ValidatedImage {
  bytes: Uint8Array;
  ext: string;
  mime: string;
}

/** Mengembalikan pesan error siap tampil, atau data file yang sudah valid. */
export async function validateImage(
  file: unknown,
): Promise<{ ok: true; image: ValidatedImage } | { ok: false; error: string }> {
  if (!(file instanceof File)) {
    return { ok: false, error: 'File tidak ditemukan. Kirim sebagai multipart/form-data field "image"' };
  }
  if (file.size === 0) {
    return { ok: false, error: 'File kosong' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: `Ukuran file maksimal ${MAX_IMAGE_SIZE / (1024 * 1024)} MB` };
  }

  const ext = path.extname(file.name).toLowerCase();
  const expected = ALLOWED_EXT[ext];
  if (!expected) {
    return { ok: false, error: 'Format file tidak didukung, gunakan: jpg, jpeg, png, atau webp' };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectMime(bytes);
  if (detected !== expected) {
    return {
      ok: false,
      error: `Isi file bukan gambar ${expected} yang valid (terdeteksi: ${detected ?? 'tidak dikenal'})`,
    };
  }

  return { ok: true, image: { bytes, ext, mime: expected } };
}

/**
 * Simpan file ke `.data/uploads` dengan nama aman & unik.
 * Nama asli dari client TIDAK dipakai — rawan path traversal ("../../x").
 * Hasil: "local:product_12_20260905_143012.jpg"
 */
export async function saveLocalImage(productId: number, image: ValidatedImage): Promise<string> {
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  // Format nama sama dengan fiber-api: product_<id>_20060102_150405.jpg
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const filename = `product_${productId}_${stamp}${image.ext}`;

  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), image.bytes);
  return `${LOCAL_IMAGE_PREFIX}${filename}`;
}

export async function removeLocalImage(stored: string | null | undefined): Promise<void> {
  if (!stored?.startsWith(LOCAL_IMAGE_PREFIX)) return;
  const filename = path.basename(stored.slice(LOCAL_IMAGE_PREFIX.length));
  try {
    await unlink(path.join(LOCAL_UPLOAD_DIR, filename));
  } catch {
    // file sudah tidak ada — tidak perlu diributkan
  }
}

/** "local:foo.jpg" -> "/api/uploads/foo.jpg" (URL yang dipakai di <img>) */
export function localImageUrl(stored: string | null | undefined): string | null {
  if (!stored?.startsWith(LOCAL_IMAGE_PREFIX)) return null;
  return `/api/uploads/${encodeURIComponent(stored.slice(LOCAL_IMAGE_PREFIX.length))}`;
}

export function imageContentType(filename: string): string {
  return ALLOWED_EXT[path.extname(filename).toLowerCase()] ?? 'application/octet-stream';
}
