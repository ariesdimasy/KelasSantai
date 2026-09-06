import type { PaginationMeta } from '../schema/common'
import { cn } from '../helper/format'

type Props = {
  meta: PaginationMeta | null
  onPageChange: (page: number) => void
}

/**
 * Paginasi sederhana: Sebelumnya / Berikutnya + daftar nomor halaman.
 * Kalau total halaman <= 1 komponen tidak dirender sama sekali.
 */
export function Pagination({ meta, onPageChange }: Props) {
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages } = meta

  // Tampilkan maksimal 5 nomor di sekitar halaman aktif supaya tidak
  // meluber saat datanya ratusan halaman.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const btn = 'inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm'

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginasi">
      <button
        type="button"
        className={cn(btn, 'border-gray-200 bg-white disabled:opacity-40')}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Sebelumnya
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            btn,
            p === page
              ? 'border-teal-600 bg-teal-600 font-semibold text-white'
              : 'border-gray-200 bg-white text-gray-700',
          )}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className={cn(btn, 'border-gray-200 bg-white disabled:opacity-40')}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Berikutnya
      </button>
    </nav>
  )
}
