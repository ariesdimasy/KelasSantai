import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {

    // spread operator
  const { id, title, price, image, category, rating } = product;

    // const title = product.title
    // const price = product.price

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          />
          {category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-gray-700 shadow-sm backdrop-blur">
              {category}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4 pb-0">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-900">
            {title}
          </h3>

          {rating && (
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <span>★</span>
              <span className="font-medium">{rating.rate}</span>
              <span className="text-gray-400">({rating.count})</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-purple-600">
            ${price}
          </span>
          <button
            type="button"
            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-purple-700 active:bg-purple-800"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
