export function UnitsTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="grid grid-cols-5 gap-4 px-6 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 rounded skeleton-luxury" />
        ))}
      </div>
      <div className="divider-gold opacity-30" />
      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 px-6 py-5 rounded-lg"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="h-4 rounded skeleton-luxury" style={{ width: "70%" }} />
          <div className="h-4 rounded skeleton-luxury" style={{ width: "50%" }} />
          <div className="h-4 rounded skeleton-luxury" style={{ width: "60%" }} />
          <div className="flex gap-1">
            <div className="h-6 w-6 rounded-full skeleton-luxury" />
            <div className="h-6 w-6 rounded-full skeleton-luxury" />
            <div className="h-6 w-6 rounded-full skeleton-luxury" />
          </div>
          <div className="h-8 w-24 rounded skeleton-luxury ml-auto" />
        </div>
      ))}
    </div>
  )
}
