export default function LoadingSkeleton({ count = 8 }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-20 animate-pulse">
      <div className="mb-8 h-8 w-48 rounded-md bg-gray-200" />

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="aspect-square w-full bg-gray-200" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="mt-2 flex items-center justify-between">
                <div className="h-5 w-12 rounded bg-gray-200" />
                <div className="h-8 w-20 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
