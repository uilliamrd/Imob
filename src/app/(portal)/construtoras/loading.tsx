export default function ConstrutorасLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="skeleton-luxury h-4 w-28 rounded mb-2" />
      <div className="skeleton-luxury h-9 w-72 rounded mb-4" />
      <div className="skeleton-luxury h-4 w-96 rounded mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <div className="skeleton-luxury aspect-[5/3] w-full" />
            <div className="p-5 space-y-2">
              <div className="skeleton-luxury h-5 w-2/3 rounded" />
              <div className="skeleton-luxury h-3 w-1/2 rounded" />
              <div className="skeleton-luxury h-3 w-1/3 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
