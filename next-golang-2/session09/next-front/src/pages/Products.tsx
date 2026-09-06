import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { listProducts } from '../api/products'
import { listCategories } from '../api/categories'
import type { Product } from '../schema/product'
import type { Category } from '../schema/category'
import type { PaginationMeta } from '../schema/common'
import { ProductCard } from '../components/ProductCard'
import { Pagination } from '../components/Pagination'
import { Alert, EmptyState, Spinner } from '../components/Feedback'
import { useSEO } from '../helper/seo'
import { errorMessage } from '../helper/form'

const PER_PAGE = 12

export default function Products() {
  useSEO({
    title: 'Daftar Produk',
    description: 'Jelajahi semua produk di SantaiStore — cari berdasarkan nama atau kategori.',
    keywords: 'daftar produk, katalog, cari produk, kategori',
  })

  // Filter disimpan di URL supaya hasil pencarian bisa di-bookmark dan
  // tombol back/forward browser tetap masuk akal.
  const [params, setParams] = useSearchParams()
  const keyword = params.get('keyword') ?? ''
  const categoryId = Number(params.get('category') ?? 0)
  const page = Number(params.get('page') ?? 1)

  // Input pencarian punya state sendiri supaya URL tidak berubah
  // setiap ketikan — hanya saat form disubmit.
  const [keywordInput, setKeywordInput] = useState(keyword)
  useEffect(() => setKeywordInput(keyword), [keyword])

  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {
        // Kegagalan memuat kategori tidak boleh menghalangi daftar produk —
        // dropdown filter saja yang jadi kosong.
      })
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listProducts({ keyword, categoryId, page, limit: PER_PAGE })
      .then((result) => {
        // Cegah response lama menimpa yang baru kalau filter cepat berubah
        if (!active) return
        setProducts(result.items)
        setMeta(result.meta)
      })
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    // setLoading(false)

    return () => {
      active = false
    }
  }, [keyword, categoryId, page])

  /** Ubah satu filter, dan selalu reset ke halaman 1 kecuali yang diubah page. */
  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
      <p className="mt-1 text-sm text-gray-600">
        {meta ? `${meta.total} produk ditemukan` : 'Memuat daftar produk…'}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            updateParams({ keyword: keywordInput.trim() })
          }}
        >
          <input
            type="search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Cari nama produk…"
            aria-label="Cari produk"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Cari
          </button>
        </form>

        <select
          value={categoryId || ''}
          onChange={(e) => updateParams({ category: e.target.value })}
          aria-label="Filter kategori"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
       
        {error && <Alert tone="error">{error}</Alert>}

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState
            title="Produk tidak ditemukan"
            description={
              keyword || categoryId
                ? 'Coba ubah kata kunci atau pilih kategori lain.'
                : 'Belum ada produk yang ditambahkan.'
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Pagination meta={meta} onPageChange={(p) => updateParams({ page: String(p) })} />
      </div>
    </div>
  )
}
