/**
 * Client ke fiber-api. HANYA dipakai di sisi server (Astro API routes / .astro
 * frontmatter) — browser tidak pernah memanggil fiber-api langsung supaya:
 *  - tidak ada masalah CORS/mixed origin,
 *  - token & URL internal tidak bocor ke client,
 *  - response GORM bisa dinormalisasi dulu sebelum sampai ke komponen.
 *
 * Endpoint fiber-api yang tersedia saat ini (lihat fiber-api/index.go):
 *   GET    /api/v1/products            (keyword, category_id, page, limit)
 *   GET    /api/v1/products/:id
 *   POST   /api/v1/products
 *   POST   /api/v1/products/category   (buat kategori + produk dalam 1 transaksi)
 *   POST   /api/v1/products/:id/image
 *   PUT    /api/v1/products/:id/image
 *   DELETE /api/v1/products/:id/image
 *
 * Yang BELUM ada di fiber-api (dilayani store lokal BFF, lihat src/lib/server/store.ts):
 *   auth/user, CRUD category, PUT/DELETE product, order
 */
import type { Category, Product } from './types';

const RAW_BASE = (import.meta.env.FIBER_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Origin fiber-api, mis. "http://localhost:3000" (untuk URL file upload). */
export const FIBER_ORIGIN = RAW_BASE;
/** Prefix REST fiber-api, mis. "http://localhost:3000/api/v1". */
export const FIBER_API = `${RAW_BASE}/api/v1`;

/** fiber-api merespons, tapi dengan status error (4xx/5xx). */
export class FiberHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'FiberHttpError';
  }
}

/** fiber-api tidak bisa dihubungi (server mati / salah URL / timeout). */
export class FiberOfflineError extends Error {
  constructor(cause?: unknown) {
    super('fiber-api tidak dapat dihubungi di ' + RAW_BASE);
    this.name = 'FiberOfflineError';
    this.cause = cause;
  }
}

interface FiberResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  meta?: { page: number; limit: number; total: number; total_pages: number };
}

export interface FiberResult<T> {
  status: number;
  ok: boolean;
  body: FiberResponse<T>;
  /**
   * false bila server membalas sesuatu yang bukan JSON — biasanya tanda
   * FIBER_API_URL menunjuk ke aplikasi lain (mis. dev server frontend),
   * bukan ke fiber-api.
   */
  isJson: boolean;
}

/**
 * Panggil fiber-api. Mengembalikan status + body tanpa melempar error untuk
 * status 4xx/5xx — supaya pemanggil bisa memutuskan sendiri (mis. status 405
 * berarti endpoint belum ada, jadi pakai fallback lokal).
 * Melempar FiberOfflineError bila server tidak bisa dihubungi.
 */
export async function fiberFetch<T = unknown>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<FiberResult<T>> {
  const { timeoutMs = 8000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${FIBER_API}${path}`, {
      ...rest,
      signal: controller.signal,
    });

    let body: FiberResponse<T> = {};
    let isJson = true;
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text) as FiberResponse<T>;
      } catch {
        // Jangan teruskan potongan HTML sebagai pesan error ke UI.
        isJson = false;
        body = {
          error:
            `Balasan dari ${RAW_BASE} bukan JSON (status ${response.status}). ` +
            'Pastikan FIBER_API_URL menunjuk ke fiber-api.',
        };
      }
    }

    return { status: response.status, ok: response.ok, body, isJson };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FiberOfflineError(error);
    }
    throw new FiberOfflineError(error);
  } finally {
    clearTimeout(timer);
  }
}

/** Sama seperti fiberFetch, tapi status error langsung dilempar. */
export async function fiberFetchOrThrow<T>(path: string, init?: RequestInit): Promise<T> {
  const result = await fiberFetch<T>(path, init);
  if (!result.ok) {
    throw new FiberHttpError(
      result.status,
      result.body.error ?? result.body.message ?? `fiber-api merespons ${result.status}`,
      result.body.errors,
    );
  }
  return result.body.data as T;
}

/**
 * Status yang artinya "endpoint ini belum ada di fiber-api".
 * Fiber membalas 405 untuk path terdaftar dengan method lain (mis. PUT /products/:id)
 * dan 404 untuk path yang sama sekali tidak terdaftar (mis. /categories).
 */
export function isEndpointMissing(status: number): boolean {
  return status === 404 || status === 405 || status === 501;
}

// --- Normalisasi response GORM -> tipe frontend -----------------------------
//
// fiber-api mengirim campuran gaya penamaan:
//   Product  -> { ID, CreatedAt, UpdatedAt, name, price, category_id, category }
//   Category -> { id, CreatedAt, UpdatedAt, name, slug, description }
// Semua dirapikan di sini supaya komponen UI hanya tahu satu bentuk.

type Raw = Record<string, unknown>;

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableDate(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

/** Ambil id dari record GORM: bisa `ID` (embedded gorm.Model) atau `id` (tag json). */
function rawId(raw: Raw): number {
  return num(raw.ID ?? raw.id, 0);
}

/** "uploads/products/x.jpg" -> "http://localhost:3000/uploads/products/x.jpg" */
export function fiberImageUrl(storedPath: string | null | undefined): string | null {
  if (!storedPath) return null;
  if (/^https?:\/\//i.test(storedPath)) return storedPath;
  return `${FIBER_ORIGIN}/${storedPath.replace(/^\/+/, '')}`;
}

export function normalizeCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Raw;
  const id = rawId(data);
  if (!id) return null;

  return {
    id,
    name: str(data.name),
    slug: str(data.slug),
    description: str(data.description),
    createdAt: nullableDate(data.CreatedAt ?? data.created_at),
    updatedAt: nullableDate(data.UpdatedAt ?? data.updated_at),
    source: 'fiber',
  };
}

export function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Raw;
  const id = rawId(data);
  if (!id) return null;

  const image = str(data.image) || null;

  return {
    id,
    name: str(data.name),
    description: str(data.description),
    price: num(data.price),
    stock: num(data.stock),
    isActive: data.is_active !== false,
    image,
    imageUrl: fiberImageUrl(image),
    categoryId: num(data.category_id),
    category: normalizeCategory(data.category),
    createdAt: nullableDate(data.CreatedAt ?? data.created_at),
    updatedAt: nullableDate(data.UpdatedAt ?? data.updated_at),
    source: 'fiber',
  };
}

export function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeProduct).filter((item): item is Product => item !== null);
}
