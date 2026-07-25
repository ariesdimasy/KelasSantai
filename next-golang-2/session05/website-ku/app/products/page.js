import ProductCard from "@/components/ProductCard";

export const metadata = {
  title: "Produk",
  description: "Jelajahi koleksi produk kami",
};

export default async function Products(){

    // Fetch langsung di server — SEO sempurna!
    const res = await fetch("https://fakestoreapi.com/products", {
        next: { revalidate: 3600 }, // update setiap 1 jam
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data produk"); // ditangkap error.jsx!
    }

    const products = await res.json();


    return ( <main className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Semua Produk</h1>
    
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
)
}