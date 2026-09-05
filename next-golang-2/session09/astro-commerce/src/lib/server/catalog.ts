/**
 * Lapisan data katalog (produk + kategori).
 *
 * Sumber utama = fiber-api. Store lokal dipakai sebagai "overlay" untuk
 * operasi yang belum tersedia di backend:
 *
 *   operasi                     | ditangani oleh
 *   ----------------------------|------------------------------------------
 *   list/detail produk          | fiber-api  GET /products, /products/:id
 *   create produk               | fiber-api  POST /products (kategori MySQL)
 *                               | store lokal (bila kategori juga lokal)
 *   update/delete produk        | fiber-api bila endpoint ada, kalau 404/405
 *                               | -> overlay lokal (patch / tombstone)
 *   upload/replace/hapus image  | fiber-api  /products/:id/image
 *                               | store lokal untuk produk lokal
 *   list kategori               | fiber-api  GET /categories, fallback:
 *                               | diturunkan dari relasi category pada produk
 *   create/update/delete kategori| store lokal (endpoint belum ada)
 *
 * Semua fungsi mengembalikan `warning` bila fiber-api tidak bisa dihubungi,
 * supaya UI bisa menampilkan banner, bukan halaman kosong tanpa penjelasan.
 */
import type { Category, PaginationMeta, Product, ProductQuery } from '@/lib/types';
import { slugify } from '@/lib/utils';
import {
  FiberOfflineError,
  fiberFetch,
  fiberImageUrl,
  isEndpointMissing,
  normalizeCategory,
  normalizeProducts,
} from '@/lib/fiber';
import { badRequest, conflict, notFound } from './errors';
import {
  type Db,
  type LocalCategory,
  type LocalProduct,
  getDb,
  isLocalId,
  mutateDb,
  nextId,
} from './store';
import {
  LOCAL_IMAGE_PREFIX,
  type ValidatedImage,
  localImageUrl,
  removeLocalImage,
  saveLocalImage,
} from './uploads';

export interface Warned<T> {
  data: T;
  warning?: string;
}

export interface ProductListResult extends Warned<Product[]> {
  meta: PaginationMeta;
}

// --- cache pendek ------------------------------------------------------------
// listProducts() dan listCategories() sering dipanggil berbarengan dalam satu
// request (mis. halaman dashboard). Cache 5 detik mencegah fiber-api dipanggil
// berulang untuk data yang sama; setiap operasi tulis langsung membatalkannya.
const CACHE_TTL_MS = 5_000;
let cache: { at: number; value: Warned<Product[]> } | null = null;

export function invalidateCatalogCache(): void {
  cache = null;
}

async function fetchFiberProducts(): Promise<Warned<Product[]>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

  let value: Warned<Product[]>;
  try {
    // fiber-api memaginasi di server; BFF butuh seluruh data untuk digabung
    // dengan overlay lokal, jadi ambil dengan limit besar lalu paginasi di sini.
    const result = await fiberFetch<unknown[]>('/products?page=1&limit=1000');
    value =
      result.ok && result.isJson
        ? { data: normalizeProducts(result.body.data) }
        : {
            data: [],
            warning: result.body.error ?? `fiber-api merespons status ${result.status}`,
          };
  } catch (error) {
    if (!(error instanceof FiberOfflineError)) throw error;
    value = { data: [], warning: error.message };
  }

  cache = { at: Date.now(), value };
  return value;
}

function resolveImageUrl(image: string | null): string | null {
  if (!image) return null;
  return image.startsWith(LOCAL_IMAGE_PREFIX) ? localImageUrl(image) : fiberImageUrl(image);
}

function toProduct(local: LocalProduct, categories: Map<number, Category>): Product {
  return {
    ...local,
    imageUrl: resolveImageUrl(local.image),
    category: categories.get(local.categoryId) ?? null,
    source: 'local',
  };
}

function toCategory(local: LocalCategory): Category {
  return { ...local, source: 'local' };
}

/** Gabungkan data fiber-api dengan overlay lokal (patch, tombstone, record baru). */
function mergeProducts(db: Db, remote: Product[], categories: Map<number, Category>): Product[] {
  const deleted = new Set(db.products.deleted);
  const patches = db.products.patches;

  const fromFiber = remote
    .filter((product) => !deleted.has(product.id))
    .map((product) => {
      const patch = patches[String(product.id)];
      if (!patch) return product;
      const merged = { ...product, ...patch };
      return {
        ...merged,
        imageUrl: resolveImageUrl(merged.image),
        category: categories.get(merged.categoryId) ?? product.category,
      };
    });

  const fromLocal = db.products.created
    .filter((product) => !deleted.has(product.id))
    .map((product) => toProduct({ ...product, ...patches[String(product.id)] }, categories));

  // produk lokal (terbaru) di atas, lalu produk fiber-api
  return [...fromLocal, ...fromFiber];
}

function mergeCategories(db: Db, remote: Category[]): Category[] {
  const deleted = new Set(db.categories.deleted);
  const patches = db.categories.patches;

  const fromFiber = remote
    .filter((category) => !deleted.has(category.id))
    .map((category) => {
      const patch = patches[String(category.id)];
      return patch ? { ...category, ...patch } : category;
    });

  const fromLocal = db.categories.created
    .filter((category) => !deleted.has(category.id))
    .map((category) => toCategory({ ...category, ...patches[String(category.id)] }));

  return [...fromFiber, ...fromLocal].sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

// --- kategori ---------------------------------------------------------------

async function fetchFiberCategories(): Promise<Warned<Category[]>> {
  try {
    const result = await fiberFetch<unknown[]>('/categories');
    if (result.ok && result.isJson && Array.isArray(result.body.data)) {
      const data = result.body.data
        .map(normalizeCategory)
        .filter((category): category is Category => category !== null);
      return { data };
    }
    // Balasan bukan JSON = server di FIBER_API_URL bukan fiber-api; sama saja
    // dengan endpoint tidak ada, jadi lanjut ke fallback di bawah.
    if (result.isJson && !isEndpointMissing(result.status)) {
      return { data: [], warning: result.body.error ?? `fiber-api merespons ${result.status}` };
    }
  } catch (error) {
    if (!(error instanceof FiberOfflineError)) throw error;
    return { data: [], warning: error.message };
  }

  // Fallback: GET /api/v1/categories belum ada di fiber-api, tapi setiap produk
  // sudah membawa relasi Category (hasil Preload), jadi kategori bisa
  // diturunkan dari daftar produk.
  const products = await fetchFiberProducts();
  const unique = new Map<number, Category>();
  for (const product of products.data) {
    if (product.category) unique.set(product.category.id, product.category);
  }

  return { data: [...unique.values()], warning: products.warning };
}

export async function listCategories(
  options: { withCount?: boolean } = {},
): Promise<Warned<Category[]>> {
  const [remote, db] = await Promise.all([fetchFiberCategories(), getDb()]);
  let categories = mergeCategories(db, remote.data);
  let warning = remote.warning;

  if (options.withCount) {
    const products = await listAllProducts();
    warning ??= products.warning;
    const counter = new Map<number, number>();
    for (const product of products.data) {
      counter.set(product.categoryId, (counter.get(product.categoryId) ?? 0) + 1);
    }
    categories = categories.map((category) => ({
      ...category,
      productCount: counter.get(category.id) ?? 0,
    }));
  }

  return { data: categories, warning };
}

export async function getCategory(id: number): Promise<Category | null> {
  const { data } = await listCategories();
  return data.find((category) => category.id === id) ?? null;
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description: string;
}): Promise<Category> {
  const existing = await listCategories();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  if (existing.data.some((category) => category.slug === slug)) {
    throw conflict(`Slug "${slug}" sudah dipakai kategori lain`);
  }

  const created = await mutateDb((db) => {
    const now = new Date().toISOString();
    const category: LocalCategory = {
      id: nextId(db, 'category'),
      name: input.name,
      slug,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };
    db.categories.created.push(category);
    return category;
  });

  invalidateCatalogCache();
  return toCategory(created);
}

export async function updateCategory(
  id: number,
  input: { name: string; slug?: string; description: string },
): Promise<Category> {
  const existing = await listCategories();
  const target = existing.data.find((category) => category.id === id);
  if (!target) throw notFound('Kategori tidak ditemukan');

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  if (existing.data.some((category) => category.slug === slug && category.id !== id)) {
    throw conflict(`Slug "${slug}" sudah dipakai kategori lain`);
  }

  const patch: Partial<LocalCategory> = {
    name: input.name,
    slug,
    description: input.description,
    updatedAt: new Date().toISOString(),
  };

  await mutateDb((db) => {
    const local = db.categories.created.find((category) => category.id === id);
    if (local) {
      Object.assign(local, patch);
      return;
    }
    // Kategori milik fiber-api: simpan sebagai patch overlay.
    db.categories.patches[String(id)] = {
      ...db.categories.patches[String(id)],
      ...patch,
    };
  });

  invalidateCatalogCache();
  return { ...target, ...patch, source: target.source };
}

export async function deleteCategory(id: number): Promise<void> {
  const category = await getCategory(id);
  if (!category) throw notFound('Kategori tidak ditemukan');

  const products = await listAllProducts();
  const used = products.data.filter((product) => product.categoryId === id).length;
  if (used > 0) {
    throw conflict(`Kategori masih dipakai ${used} produk. Pindahkan produknya dulu.`);
  }

  await mutateDb((db) => {
    db.categories.created = db.categories.created.filter((item) => item.id !== id);
    delete db.categories.patches[String(id)];
    if (!isLocalId(id) && !db.categories.deleted.includes(id)) {
      db.categories.deleted.push(id);
    }
  });

  invalidateCatalogCache();
}

// --- produk -----------------------------------------------------------------

/** Semua produk (fiber + lokal) tanpa filter/paginasi. */
export async function listAllProducts(): Promise<Warned<Product[]>> {
  const [remote, db, categories] = await Promise.all([
    fetchFiberProducts(),
    getDb(),
    fetchFiberCategories(),
  ]);

  const categoryMap = new Map<number, Category>();
  for (const category of mergeCategories(db, categories.data)) {
    categoryMap.set(category.id, category);
  }

  return {
    data: mergeProducts(db, remote.data, categoryMap),
    warning: remote.warning ?? categories.warning,
  };
}

export async function listProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const { keyword = '', categoryId = 0, page = 1, limit = 12, sort = 'newest' } = query;
  const all = await listAllProducts();

  const needle = keyword.trim().toLowerCase();
  let items = all.data.filter((product) => {
    if (categoryId > 0 && product.categoryId !== categoryId) return false;
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      product.description.toLowerCase().includes(needle) ||
      (product.category?.name.toLowerCase().includes(needle) ?? false)
    );
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name, 'id');
      default:
        return b.id - a.id; // terbaru dulu
    }
  });

  const total = items.length;
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safeLimit;

  return {
    data: items.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total, totalPages },
    warning: all.warning,
  };
}

export async function getProduct(id: number): Promise<Product | null> {
  const db = await getDb();
  if (db.products.deleted.includes(id)) return null;

  const local = db.products.created.find((product) => product.id === id);
  if (local) {
    const categories = await listCategories();
    const map = new Map(categories.data.map((category) => [category.id, category]));
    return toProduct({ ...local, ...db.products.patches[String(id)] }, map);
  }

  // Ambil detail langsung dari fiber-api (lebih hemat daripada list semua)
  try {
    const result = await fiberFetch<unknown>(`/products/${id}`);
    if (result.ok) {
      const [product] = normalizeProducts([result.body.data]);
      if (!product) return null;
      const patch = db.products.patches[String(id)];
      if (!patch) return product;
      const merged = { ...product, ...patch };
      return { ...merged, imageUrl: resolveImageUrl(merged.image) };
    }
    if (result.status === 404) return null;
  } catch (error) {
    if (!(error instanceof FiberOfflineError)) throw error;
  }

  // fiber-api mati -> coba dari data yang sudah tergabung
  const all = await listAllProducts();
  return all.data.find((product) => product.id === id) ?? null;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  isActive: boolean;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const category = await getCategory(payload.categoryId);
  if (!category) throw badRequest('Kategori tidak ditemukan', { categoryId: 'Kategori tidak valid' });

  // Kategori milik MySQL -> simpan lewat fiber-api supaya jadi data sesungguhnya.
  if (category.source === 'fiber') {
    try {
      const result = await fiberFetch<unknown>('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          category: payload.categoryId, // fiber-api memakai key "category" untuk id
        }),
      });

      if (result.ok) {
        invalidateCatalogCache();
        const [product] = normalizeProducts([result.body.data]);
        if (product) {
          if (!payload.isActive) return updateProduct(product.id, payload);
          return product;
        }
      } else if (result.isJson && !isEndpointMissing(result.status)) {
        throw badRequest(
          result.body.error ?? 'Gagal menyimpan produk ke fiber-api',
          result.body.errors,
        );
      }
    } catch (error) {
      if (!(error instanceof FiberOfflineError)) throw error;
      // fiber-api mati -> lanjut simpan lokal supaya pekerjaan admin tidak hilang
    }
  }

  const created = await mutateDb((db) => {
    const now = new Date().toISOString();
    const product: LocalProduct = {
      id: nextId(db, 'product'),
      name: payload.name,
      description: payload.description,
      price: payload.price,
      stock: payload.stock,
      isActive: payload.isActive,
      image: null,
      categoryId: payload.categoryId,
      createdAt: now,
      updatedAt: now,
    };
    db.products.created.push(product);
    return product;
  });

  invalidateCatalogCache();
  return toProduct(created, new Map([[category.id, category]]));
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const product = await getProduct(id);
  if (!product) throw notFound('Produk tidak ditemukan');

  const category = await getCategory(payload.categoryId);
  if (!category) throw badRequest('Kategori tidak ditemukan', { categoryId: 'Kategori tidak valid' });

  const patch: Partial<LocalProduct> = {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    stock: payload.stock,
    categoryId: payload.categoryId,
    isActive: payload.isActive,
    updatedAt: new Date().toISOString(),
  };

  if (!isLocalId(id)) {
    // Coba endpoint fiber-api dulu — kalau nanti PUT /products/:id sudah dibuat,
    // kode ini otomatis memakainya tanpa perlu diubah.
    try {
      const result = await fiberFetch<unknown>(`/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          category: payload.categoryId,
          is_active: payload.isActive,
        }),
      });

      if (result.ok) {
        invalidateCatalogCache();
        const [updated] = normalizeProducts([result.body.data]);
        if (updated) return updated;
      } else if (result.isJson && !isEndpointMissing(result.status)) {
        throw badRequest(result.body.error ?? 'Gagal memperbarui produk', result.body.errors);
      }
    } catch (error) {
      if (!(error instanceof FiberOfflineError)) throw error;
    }
  }

  await mutateDb((db) => {
    const local = db.products.created.find((item) => item.id === id);
    if (local) {
      Object.assign(local, patch);
      return;
    }
    db.products.patches[String(id)] = { ...db.products.patches[String(id)], ...patch };
  });

  invalidateCatalogCache();
  return { ...product, ...patch, category, source: product.source };
}

export async function deleteProduct(id: number): Promise<void> {
  const product = await getProduct(id);
  if (!product) throw notFound('Produk tidak ditemukan');

  if (!isLocalId(id)) {
    try {
      const result = await fiberFetch(`/products/${id}`, { method: 'DELETE' });
      if (!result.ok && result.isJson && !isEndpointMissing(result.status)) {
        throw badRequest(result.body.error ?? 'Gagal menghapus produk');
      }
    } catch (error) {
      if (!(error instanceof FiberOfflineError)) throw error;
    }
  }

  await removeLocalImage(product.image);

  await mutateDb((db) => {
    db.products.created = db.products.created.filter((item) => item.id !== id);
    delete db.products.patches[String(id)];
    if (!isLocalId(id) && !db.products.deleted.includes(id)) {
      db.products.deleted.push(id);
    }
  });

  invalidateCatalogCache();
}

// --- image produk (1 produk = 1 image) --------------------------------------

/**
 * Simpan image produk.
 * - Produk fiber-api: file diteruskan ke fiber-api (POST bila belum ada image,
 *   PUT bila mengganti) agar file tetap satu tempat dengan datanya.
 * - Produk lokal / fiber-api mati: file disimpan di `.data/uploads`.
 */
export async function setProductImage(id: number, file: File, image: ValidatedImage): Promise<Product> {
  const product = await getProduct(id);
  if (!product) throw notFound('Produk tidak ditemukan');

  if (!isLocalId(id) && !product.image?.startsWith(LOCAL_IMAGE_PREFIX)) {
    try {
      const form = new FormData();
      form.append('image', file, file.name);

      const method = product.image ? 'PUT' : 'POST';
      const result = await fiberFetch<{ image?: string }>(`/products/${id}/image`, {
        method,
        body: form,
        timeoutMs: 20_000,
      });

      if (result.ok) {
        invalidateCatalogCache();
        const stored = result.body.data?.image ?? null;
        return { ...product, image: stored, imageUrl: resolveImageUrl(stored) };
      }
      if (result.isJson && !isEndpointMissing(result.status)) {
        throw badRequest(result.body.error ?? 'Gagal mengunggah image ke fiber-api');
      }
    } catch (error) {
      if (!(error instanceof FiberOfflineError)) throw error;
    }
  }

  const stored = await saveLocalImage(id, image);
  await removeLocalImage(product.image);

  await mutateDb((db) => {
    const local = db.products.created.find((item) => item.id === id);
    if (local) {
      local.image = stored;
      local.updatedAt = new Date().toISOString();
      return;
    }
    db.products.patches[String(id)] = {
      ...db.products.patches[String(id)],
      image: stored,
      updatedAt: new Date().toISOString(),
    };
  });

  invalidateCatalogCache();
  return { ...product, image: stored, imageUrl: resolveImageUrl(stored) };
}

export async function deleteProductImage(id: number): Promise<Product> {
  const product = await getProduct(id);
  if (!product) throw notFound('Produk tidak ditemukan');
  if (!product.image) throw notFound('Produk ini belum memiliki image');

  if (!product.image.startsWith(LOCAL_IMAGE_PREFIX)) {
    try {
      const result = await fiberFetch(`/products/${id}/image`, { method: 'DELETE' });
      if (!result.ok && result.isJson && !isEndpointMissing(result.status)) {
        throw badRequest(result.body.error ?? 'Gagal menghapus image produk');
      }
    } catch (error) {
      if (!(error instanceof FiberOfflineError)) throw error;
    }
  } else {
    await removeLocalImage(product.image);
  }

  await mutateDb((db) => {
    const local = db.products.created.find((item) => item.id === id);
    if (local) {
      local.image = null;
      return;
    }
    db.products.patches[String(id)] = {
      ...db.products.patches[String(id)],
      image: null,
      updatedAt: new Date().toISOString(),
    };
  });

  invalidateCatalogCache();
  return { ...product, image: null, imageUrl: null };
}
