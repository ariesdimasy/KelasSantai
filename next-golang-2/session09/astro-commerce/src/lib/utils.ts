import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

/** cn: gabung class Tailwind, konflik class terakhir yang menang. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rp 1.250.000 */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 05 Sep 2026 */
export function formatDate(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy', { locale: localeID }) : '-';
}

/** 05 Sep 2026, 14:30 */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy, HH:mm', { locale: localeID }) : '-';
}

/** "3 hari lalu" */
export function formatRelative(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date
    ? formatDistanceToNow(date, { addSuffix: true, locale: localeID })
    : '-';
}

/** "Tas Kulit Pria" -> "tas-kulit-pria" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Potong teks panjang untuk deskripsi meta / kartu produk. */
export function truncate(value: string, max = 140): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/** Inisial nama untuk avatar: "Dimas Yudhistira" -> "DY" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
