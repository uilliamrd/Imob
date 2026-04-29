export default function CorretorPageLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        <div className="skeleton-luxury w-32 h-32 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="skeleton-luxury h-8 w-56 rounded" />
          <div className="skeleton-luxury h-4 w-40 rounded" />
          <div className="skeleton-luxury h-4 w-72 rounded" />
          <div className="flex gap-2 mt-2">
            <div className="skeleton-luxury h-8 w-24 rounded-full" />
            <div className="skeleton-luxury h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="skeleton-luxury h-7 w-48 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
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
  )
}
