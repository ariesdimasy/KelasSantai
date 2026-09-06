import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getProduct } from '../api/products'
import type { Product } from '../schema/product'
import { Alert, Spinner } from '../components/Feedback'
import { formatDate, formatRupiah, productImageUrl } from '../helper/format'
import { useSEO } from '../helper/seo'
import { errorMessage } from '../helper/form'

export default function ProductDetail() {
  const { id } = useParams()
  const productId = Number(id)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // SEO memakai data produk begitu tersedia; sebelum itu pakai teks netral.
  useSEO({
    title: product?.name ?? 'Detail Produk',
    description: product
      ? `${product.name} — ${formatRupiah(product.price)}. ${product.description}`.slice(0, 160)
      : 'Detail produk di SantaiStore.',
    keywords: product
      ? `${product.name}, ${product.category?.name ?? 'produk'}, beli online`
      : 'detail produk',
  })

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('ID produk tidak valid')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    getProduct(productId)
      .then((data) => active && setProduct(data))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [productId])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Spinner label="Memuat produk…" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Alert tone="error">{error || 'Produk tidak ditemukan'}</Alert>
        <Link to="/products" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
          ← Kembali ke daftar produk
        </Link>
      </div>
    )
  }

  const image = productImageUrl(product.image)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-teal-700">
          Beranda
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/products" className="hover:text-teal-700">
          Produk
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          {image ? (
            <img src={image} alt={product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-gray-400">
              Tanpa gambar
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <Link
              to={`/products?category=${product.category.id}`}
              className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="mt-3 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-teal-700">{formatRupiah(product.price)}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={
                product.isActive
                  ? 'rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700'
                  : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
              }
            >
              {product.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
            <span
              className={
                product.stock > 0
                  ? 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'
                  : 'rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700'
              }
            >
              {product.stock > 0 ? `Stok ${product.stock}` : 'Stok habis'}
            </span>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">Deskripsi</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-600">
              {product.description || 'Belum ada deskripsi.'}
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Ditambahkan {formatDate(product.createdAt)}
          </p>

          <button
            type="button"
            disabled={product.stock === 0 || !product.isActive}
            className="mt-6 w-full rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Keranjang belum tersedia — backend belum punya endpoint order.
          </p>
        </div>
      </div>
    </div>
  )
}
