import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(id) {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const product = await res.json();
  return product?.id ? product : null;
}

export async function generateMetadata({ params }) {
  const { detail } = await params;
  const product = await getProduct(detail);

  if (!product) {
    return { title: "Produk tidak ditemukan" };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetail({ params }) {
  const { detail } = await params;
  const product = await getProduct(detail);

  if (!product) notFound();

  const { title, price, image, category, description, rating } = product;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-purple-600"
      >
        ← Kembali ke Produk
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-10"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          {category && (
            <span className="w-fit rounded-full bg-purple-100 px-3 py-1 text-xs font-medium capitalize text-purple-700">
              {category}
            </span>
          )}

          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h1>

          {rating && (
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <span>★</span>
              <span className="font-medium text-gray-700">{rating.rate}</span>
              <span className="text-gray-400">({rating.count} ulasan)</span>
            </div>
          )}

          <p className="text-3xl font-bold text-purple-600">${price}</p>

          <p className="leading-relaxed text-gray-600">{description}</p>

          <div className="mt-4">
            <button
              type="button"
              className="w-full rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700 active:bg-purple-800 md:w-auto"
            >
              + Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
