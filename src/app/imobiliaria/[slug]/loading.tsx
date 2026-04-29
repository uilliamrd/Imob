export default function ImobiliariaPageLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className="h-[40vh] skeleton-luxury" />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* About */}
        <div className="space-y-3">
          <div className="skeleton-luxury h-8 w-64 rounded" />
          <div className="skeleton-luxury h-4 w-full rounded" />
          <div className="skeleton-luxury h-4 w-3/4 rounded" />
        </div>

        {/* Properties grid */}
        <div>
          <div className="skeleton-luxury h-7 w-48 rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <div className="skeleton-luxury aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton-luxury h-4 w-3/4 rounded" />
                  <div className="skeleton-luxury h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
