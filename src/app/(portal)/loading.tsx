export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[85vh] bg-muted" />

      {/* Stats strip */}
      <div className="bg-card border-y border-border py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton-luxury h-8 w-24 rounded" />
              <div className="skeleton-luxury h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Featured properties strip */}
      <div className="py-16 px-4 max-w-7xl mx-auto">
        <div className="skeleton-luxury h-4 w-32 rounded mb-2" />
        <div className="skeleton-luxury h-8 w-64 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border">
              <div className="skeleton-luxury aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton-luxury h-4 w-3/4 rounded" />
                <div className="skeleton-luxury h-3 w-1/2 rounded" />
                <div className="skeleton-luxury h-6 w-1/3 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
