export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-muted/50 rounded-lg" />
        <div className="h-9 w-36 bg-muted/50 rounded-lg" />
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 flex-1 bg-muted/50 rounded-lg" />
        <div className="h-10 w-28 bg-muted/50 rounded-lg" />
        <div className="h-10 w-28 bg-muted/50 rounded-lg" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-muted/50" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted/50 rounded" />
              <div className="h-3 w-1/2 bg-muted/50 rounded" />
              <div className="flex gap-3 mt-3">
                <div className="h-3 w-16 bg-muted/50 rounded" />
                <div className="h-3 w-16 bg-muted/50 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
