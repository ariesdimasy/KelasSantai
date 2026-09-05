/**
 * Store lokal BFF — "database sementara" untuk hal-hal yang BELUM ada di fiber-api:
 *
 *   users     : tabel user + auth (fiber-api belum punya models/user.go)
 *   categories: create/update/delete kategori (fiber-api belum punya /categories)
 *   products  : update/delete produk + produk yang dibuat dengan kategori lokal
 *   orders    : hasil checkout
 *
 * Bentuk penyimpanan: satu file JSON di `.data/db.json` (di-gitignore).
 * Produk & kategori dari fiber-api TETAP jadi sumber utama; store ini hanya
 * menyimpan "overlay" berupa:
 *   - created : record baru yang hanya ada di lokal (id >= LOCAL_ID_BASE)
 *   - patches : perubahan atas record milik fiber-api (key = id)
 *   - deleted : id record fiber-api yang dianggap terhapus (tombstone)
 *
 * Cara migrasi ke fiber-api nanti: hapus pemakaian overlay di
 * `products.ts`/`categories.ts` setelah endpoint aslinya tersedia.
 */
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Category, Order, Product, Role } from '@/lib/types';
import { hashPassword } from './password';

/** ID record lokal mulai dari sini supaya tidak pernah bentrok dengan ID MySQL. */
export const LOCAL_ID_BASE = 900_000;

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** Folder file upload untuk produk yang dibuat lokal. */
export const LOCAL_UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Produk yang hanya ada di store lokal. */
export type LocalProduct = Omit<Product, 'category' | 'imageUrl' | 'source'>;
export type LocalCategory = Omit<Category, 'source' | 'productCount'>;

interface Overlay<TCreated, TPatch> {
  created: TCreated[];
  patches: Record<string, TPatch>;
  deleted: number[];
}

export interface Db {
  version: number;
  sequences: { user: number; category: number; product: number; order: number };
  users: StoredUser[];
  categories: Overlay<LocalCategory, Partial<LocalCategory>>;
  products: Overlay<LocalProduct, Partial<LocalProduct>>;
  orders: Order[];
}

function emptyDb(): Db {
  return {
    version: 1,
    sequences: {
      user: 1,
      category: LOCAL_ID_BASE,
      product: LOCAL_ID_BASE,
      order: 1,
    },
    users: [],
    categories: { created: [], patches: {}, deleted: [] },
    products: { created: [], patches: {}, deleted: [] },
    orders: [],
  };
}

/**
 * Akun demo yang dibuat otomatis saat store pertama kali dipakai.
 * Ganti/hapus lewat halaman /dashboard/users.
 */
const SEED_USERS: Array<{ name: string; email: string; password: string; role: Role }> = [
  { name: 'Admin Astro', email: 'admin@astro.dev', password: 'admin123', role: 'admin' },
  { name: 'Budi Pelanggan', email: 'user@astro.dev', password: 'user123', role: 'user' },
];

let cache: Db | null = null;
/** Antrian penulisan: read-modify-write dijalankan satu per satu. */
let queue: Promise<unknown> = Promise.resolve();
/** Proses load yang sedang berjalan — dipakai bersama oleh pemanggil paralel. */
let loading: Promise<Db> | null = null;

async function persist(db: Db): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  // Tulis ke file temp lalu rename — supaya db.json tidak pernah setengah tertulis.
  // Nama temp harus unik per penulisan; kalau tidak, dua penulisan bersamaan
  // akan saling merebut file yang sama (rename gagal ENOENT).
  const tempFile = `${DB_FILE}.${randomUUID()}.tmp`;
  await writeFile(tempFile, JSON.stringify(db, null, 2), 'utf8');
  await rename(tempFile, DB_FILE);
}

async function readOrSeed(): Promise<Db> {
  try {
    const raw = await readFile(DB_FILE, 'utf8');
    return { ...emptyDb(), ...(JSON.parse(raw) as Db) };
  } catch {
    // File belum ada / rusak -> bikin baru + seed akun demo
    const db = emptyDb();
    for (const seed of SEED_USERS) {
      const now = new Date().toISOString();
      db.users.push({
        id: nextId(db, 'user'),
        name: seed.name,
        email: seed.email,
        passwordHash: await hashPassword(seed.password),
        role: seed.role,
        createdAt: now,
        updatedAt: now,
      });
    }
    await persist(db);
    return db;
  }
}

/**
 * Baca file store sekali saja walau dipanggil paralel.
 *
 * Halaman seperti /dashboard memanggil beberapa service lewat Promise.all;
 * tanpa `loading` semua pemanggil akan menjalankan seed masing-masing dan
 * saling menimpa file.
 */
async function load(): Promise<Db> {
  if (cache) return cache;

  loading ??= readOrSeed().then(
    (db) => {
      cache = db;
      loading = null;
      return db;
    },
    (error: unknown) => {
      loading = null;
      throw error;
    },
  );

  return loading;
}

/** Baca store (read-only). Jangan memutasi objek hasilnya. */
export async function getDb(): Promise<Db> {
  return load();
}

/**
 * Ubah store dengan aman: pemanggilan diserialisasi, hasilnya langsung
 * ditulis ke disk.
 *
 *   const user = await mutateDb((db) => { db.users.push(...); return ...; });
 */
export async function mutateDb<T>(mutator: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await mutator(db);
    await persist(db);
    return result;
  });

  // rantai antrian tidak boleh putus walau ada error
  queue = run.catch(() => undefined);
  return run;
}

export function nextId(db: Db, key: keyof Db['sequences']): number {
  const id = db.sequences[key];
  db.sequences[key] = id + 1;
  return id;
}

/** true bila id berasal dari store lokal (bukan dari MySQL/fiber-api). */
export function isLocalId(id: number): boolean {
  return id >= LOCAL_ID_BASE;
}
