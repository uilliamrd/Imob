export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted/50 rounded" />
        <div className="h-8 w-32 bg-muted/50 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-8 w-14 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted/50 rounded-lg" />
        ))}
      </div>

      {/* Plan rows */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-3 border-b border-border flex gap-6">
          <div className="h-3 w-32 bg-muted/50 rounded" />
          <div className="h-3 w-16 bg-muted/50 rounded ml-auto" />
          <div className="h-3 w-20 bg-muted/50 rounded" />
          <div className="h-3 w-24 bg-muted/50 rounded" />
          <div className="h-3 w-16 bg-muted/50 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-border/50 flex items-center gap-4">
            <div className="w-9 h-9 bg-muted/50 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-muted/50 rounded" />
              <div className="h-3 w-24 bg-muted/50 rounded" />
            </div>
            <div className="h-6 w-16 bg-muted/50 rounded-full" />
            <div className="h-5 w-20 bg-muted/50 rounded-full" />
            <div className="h-3 w-24 bg-muted/50 rounded" />
            <div className="h-8 w-20 bg-muted/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
