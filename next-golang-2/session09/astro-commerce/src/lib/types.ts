/**
 * Tipe data yang dipakai di seluruh aplikasi (storefront + dashboard).
 *
 * Catatan penting:
 * fiber-api mengembalikan field ala GORM (`ID`, `CreatedAt`, `category_id`).
 * Bentuk itu TIDAK dipakai langsung di UI. Semua response dinormalisasi dulu
 * di `src/lib/fiber.ts` menjadi tipe camelCase di bawah ini, supaya komponen
 * React tidak ikut berubah kalau bentuk response backend berubah.
 */

export type Role = 'admin' | 'user';

/** Sumber data sebuah record: dari fiber-api (MySQL) atau dari store lokal BFF. */
export type DataSource = 'fiber' | 'local';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
  source: DataSource;
  /** jumlah produk pada kategori ini (dihitung di BFF) */
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  /** path penyimpanan mentah dari backend, mis. "uploads/products/x.jpg" */
  image: string | null;
  /** URL siap pakai di tag <img>, sudah absolut/relatif dengan benar */
  imageUrl: string | null;
  categoryId: number;
  category: Category | null;
  createdAt: string | null;
  updatedAt: string | null;
  source: DataSource;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Data user yang aman dikirim ke browser (tanpa password hash). */
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'done' | 'cancelled';

export interface Order {
  id: number;
  code: string;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  recipient: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    note: string;
  };
  paymentMethod: 'transfer' | 'cod' | 'ewallet';
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Envelope response semua Astro API route — mengikuti gaya fiber-api. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  /** error per-field hasil validasi zod: { email: "format email tidak valid" } */
  errors?: Record<string, string>;
  meta?: PaginationMeta;
  /** peringatan non-fatal, mis. "fiber-api tidak dapat dihubungi" */
  warning?: string;
}

export interface ProductQuery {
  keyword?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
}
