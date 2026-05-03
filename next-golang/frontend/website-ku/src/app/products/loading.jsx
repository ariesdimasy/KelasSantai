export default function LoadingProducts() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      {/* Heading skeleton */}
      <div className="h-10 bg-gray-200 rounded w-48
                      mb-8 animate-pulse" />

      {/* Grid skeleton cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_,i) => (
          <div key={i} className="animate-pulse">
            {/* Gambar */}
            <div className="aspect-square bg-gray-200
                            rounded-xl mb-3" />
            {/* Judul */}
            <div className="h-4 bg-gray-200 rounded
                            w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded
                            w-2/3 mb-2" />
            {/* Harga */}
            <div className="h-5 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}