import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listProducts } from '../api/products'
import { listCategories } from '../api/categories'
import type { Product } from '../schema/product'
import type { Category } from '../schema/category'
import { ProductCard } from '../components/ProductCard'
import { Alert, Spinner } from '../components/Feedback'
import { useSEO } from '../helper/seo'
import { errorMessage } from '../helper/form'

export default function Landing() {
  useSEO({
    title: 'Belanja Simpel & Cepat',
    description:
      'SantaiStore adalah e-commerce sederhana untuk belanja elektronik, fashion, dan kuliner dengan harga jujur.',
    keywords: 'ecommerce, toko online, belanja online, elektronik, fashion, kuliner',
  })

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Landing hanya butuh cuplikan, jadi ambil 4 produk terbaru saja.
    Promise.all([listProducts({ limit: 4 }), listCategories()])
      .then(([productPage, categoryList]) => {
        setProducts(productPage.items)
        setCategories(categoryList)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            Latihan React + Fiber
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Belanja santai, tanpa ribet
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Katalog produk sederhana yang datanya diambil langsung dari REST API Go Fiber.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/products"
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Lihat Produk
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Buat Akun
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {error && <Alert tone="error">{error}</Alert>}

        {loading ? (
          <Spinner />
        ) : (
          <>
            {categories.length > 0 && (
              <section className="mb-14">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Kategori</h2>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-teal-500 hover:text-teal-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Produk Terbaru</h2>
                <Link to="/products" className="text-sm font-medium text-teal-700 hover:underline">
                  Lihat semua
                </Link>
              </div>

              {products.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">
                  Belum ada produk. Tambahkan dari dashboard admin.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}
