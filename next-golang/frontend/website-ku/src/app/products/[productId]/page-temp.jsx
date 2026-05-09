// app/products/[id]/page.jsx
import { notFound } from "next/navigation";

// Metadata dinamis berdasarkan data produk
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.title,
    description: product.description.slice(0, 150),
  };
}

async function getProduct(id) {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.id);  // params.id = dari URL /products/5

  if (!product) return notFound();  // tampilkan halaman 404

  return (
    <main className="max-w-5xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8">
          <img src={product.image} alt={product.title} className="max-h-full object-contain" />
        </div>
        <div>
          <span className="text-sm text-teal-600 font-semibold capitalize">{product.category}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">{product.title}</h1>
          <p className="text-3xl font-black text-teal-600 mb-6">${product.price}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      </div>
    </main>
  );
}
