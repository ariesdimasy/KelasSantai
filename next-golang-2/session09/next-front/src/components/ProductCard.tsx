import { Link } from 'react-router'
import type { Product } from '../schema/product'
import { formatRupiah, productImageUrl } from '../helper/format'

export function ProductCard({ product }: { product: Product }) {
  const image = productImageUrl(product.image)

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-teal-500 hover:shadow-md"
    >
      <div className="aspect-4/3 overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-gray-400">
            Tanpa gambar
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="mb-1.5 self-start rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
            {product.category.name}
          </span>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</h3>

        <p className="mt-auto pt-3 text-base font-bold text-gray-900">
          {formatRupiah(product.price)}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {product.stock > 0 ? `Stok ${product.stock}` : 'Stok habis'}
        </p>
      </div>
    </Link>
  )
}
