import { API_BASE_URL } from '../api/client'

/** 8500000 -> "Rp 8.500.000" */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** "2026-09-06T09:18:28+07:00" -> "6 Sep 2026" */
export function formatDate(iso: string): string {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Backend menyimpan kolom image sebagai path relatif hasil filepath.Join,
 * mis. "uploads/products/product_1_abc.jpg", dan menyajikannya sebagai
 * static file di /uploads. Jadi tinggal ditempel ke origin API.
 *
 * Mengembalikan null kalau produk belum punya image, supaya komponen bisa
 * memilih menampilkan placeholder.
 */
export function productImageUrl(image: string): string | null {
  if (!image) return null
  const path = image.replace(/\\/g, '/').replace(/^\/+/, '')
  return `${API_BASE_URL}/${path}`
}

/** Gabung class Tailwind, buang yang falsy. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
