export default function ErrorMessage({ msg = "Terjadi kesalahan. Silakan coba lagi." }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
        !
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Gagal memuat data</h2>
      <p className="text-sm text-gray-500">{msg}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700 active:bg-purple-800"
      >
        Coba Lagi
      </button>
    </main>
  );
}
