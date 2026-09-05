/**
 * State keranjang (zustand + persist).
 *
 * Keranjang sengaja disimpan di localStorage, bukan di server:
 *  - tidak perlu login untuk mulai belanja,
 *  - tidak ada request ke server setiap klik "+".
 * Saat checkout, isi keranjang dikirim ke server dan HARGA DIHITUNG ULANG
 * di sana (lihat src/lib/server/orders.ts) — data di localStorage tidak
 * boleh dipercaya.
 */
import { create } from 'zustand';
import { type StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/lib/types';

/**
 * Island keranjang juga dirender di server (SSR), dan di sana localStorage
 * tidak ada. Pakai storage kosong supaya SSR tidak error — isi keranjang yang
 * sebenarnya dibaca setelah hydration di browser (lihat useHydrated).
 */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  /** disimpan agar tombol "+" bisa dibatasi tanpa request ulang */
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Tambah produk; kalau sudah ada, jumlahnya ditambah (dibatasi stok). */
  add: (product: Product, quantity?: number) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      // sinkronkan harga/stok terbaru dari katalog
                      price: product.price,
                      stock: product.stock,
                      imageUrl: product.imageUrl,
                      quantity: Math.min(item.quantity + quantity, product.stock),
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                quantity: Math.max(1, Math.min(quantity, product.stock)),
              },
            ],
          };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(Math.max(quantity, 0), item.stock) }
                : item,
            )
            // quantity 0 = hapus dari keranjang
            .filter((item) => item.quantity > 0),
        })),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item,
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'astro-commerce-cart',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.localStorage,
      ),
      version: 1,
    },
  ),
);

// --- selector ---------------------------------------------------------------
// Dipakai sebagai useCartStore(selectTotalItems) supaya komponen hanya
// re-render kalau nilai yang dipilih berubah.

export const selectTotalItems = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectItemQuantity =
  (productId: number) =>
  (state: CartState): number =>
    state.items.find((item) => item.productId === productId)?.quantity ?? 0;
