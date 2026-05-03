// app/products/error.jsx
// WAJIB "use client"
"use client";

export default function ErrorPage({
  error, reset
}) {
  return (
    <div className="flex items-center
                    justify-center
                    min-h-[50vh]">
      <div className="text-center p-8">
        <p className="text-5xl mb-4">❌</p>
        <h2 className="font-bold text-xl mb-3">
          Gagal Memuat Data
        </h2>
        <p className="text-gray-500 mb-6">
          {error.message}
        </p>
        <button
          onClick={() => reset()}
          className="bg-teal-600 text-white
                     px-6 py-3 rounded-xl">
          🔄 Coba Lagi
        </button>
      </div>
    </div>
  );
}
