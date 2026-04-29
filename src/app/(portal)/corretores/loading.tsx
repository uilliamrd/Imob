export default function CorretoresLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="skeleton-luxury h-4 w-28 rounded mb-2" />
      <div className="skeleton-luxury h-9 w-72 rounded mb-4" />
      <div className="skeleton-luxury h-4 w-96 rounded mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
            <div className="skeleton-luxury w-20 h-20 rounded-full mx-auto" />
            <div className="skeleton-luxury h-4 w-1/2 rounded mx-auto" />
            <div className="skeleton-luxury h-3 w-2/3 rounded mx-auto" />
            <div className="skeleton-luxury h-3 w-1/3 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
