import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listProducts } from '../api/products'
import { listCategories } from '../api/categories'
import { listUsers } from '../api/users'
import type { Product } from '../schema/product'
import type { User } from '../schema/auth'
import { Alert, Spinner } from '../components/Feedback'
import { formatDate, formatRupiah } from '../helper/format'
import { useSEO } from '../helper/seo'
import { errorMessage } from '../helper/form'

type Summary = {
  totalProducts: number
  totalCategories: number
  totalUsers: number
  outOfStock: number
  latestProducts: Product[]
  latestUsers: User[]
}

export default function Dashboard() {
  useSEO({
    title: 'Dashboard Admin',
    description: 'Ringkasan produk, kategori, dan pengguna SantaiStore.',
    keywords: 'dashboard, admin, ringkasan',
  })

  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Belum ada endpoint statistik khusus, jadi angka diambil dari
    // `meta.total` masing-masing list dengan limit kecil — cukup untuk
    // ringkasan tanpa menarik seluruh tabel.
    Promise.all([listProducts({ limit: 5 }), listCategories(), listUsers({ limit: 5 })])
      .then(([products, categories, users]) => {
        setSummary({
          totalProducts: products.meta?.total ?? products.items.length,
          totalCategories: categories.length,
          totalUsers: users.meta?.total ?? users.items.length,
          outOfStock: products.items.filter((p) => p.stock === 0).length,
          latestProducts: products.items,
          latestUsers: users.items,
        })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Memuat ringkasan…" />
  if (error) return <Alert tone="error">{error}</Alert>
  if (!summary) return null

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Ringkasan</h1>
      <p className="mt-1 text-sm text-gray-600">Kondisi toko secara singkat.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Produk" value={summary.totalProducts} />
        <Stat label="Kategori" value={summary.totalCategories} />
        <Stat label="Pengguna" value={summary.totalUsers} />
        <Stat
          label="Stok habis"
          value={summary.outOfStock}
          hint="dari 5 produk terbaru"
          tone={summary.outOfStock > 0 ? 'warn' : 'normal'}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white">
          <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">Produk Terbaru</h2>
            <Link to="/dashboard/products" className="text-xs font-medium text-teal-700 hover:underline">
              Kelola
            </Link>
          </header>

          {summary.latestProducts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">Belum ada produk.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {summary.latestProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name ?? 'Tanpa kategori'} · Stok {product.stock}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatRupiah(product.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white">
          <header className="border-b border-gray-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">Pengguna Terbaru</h2>
          </header>

          {summary.latestUsers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">Belum ada pengguna.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {summary.latestUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-end">
                    <span
                      className={
                        user.role === 'admin'
                          ? 'rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700'
                          : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                      }
                    >
                      {user.role || 'user'}
                    </span>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = 'normal',
}: {
  label: string
  value: number
  hint?: string
  tone?: 'normal' | 'warn'
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={
          tone === 'warn'
            ? 'mt-1.5 text-2xl font-bold text-amber-600'
            : 'mt-1.5 text-2xl font-bold text-gray-900'
        }
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
