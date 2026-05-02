export const metadata = {
  title: "Tentang Kami",
  // Hasil: "Tentang Kami | WebsiteKu"
  description: "Kenali tim kami",
  openGraph: {
    title: "Tentang Kami — WebsiteKu",
    images: ["/og-about.jpg"],
  },
};


export default function About(){
    return (<main className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold
                       text-gray-900 mb-6">
          Tentang Kami
        </h1>
        <p className="text-lg text-gray-600
                      leading-relaxed">
          Kami adalah tim developer
          yang passionate membangun
          produk digital terbaik.
        </p>
      </div>
    </main>
)
}