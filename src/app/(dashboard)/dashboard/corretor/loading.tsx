export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* PageHeader */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-20 bg-muted/50 rounded" />
        <div className="h-8 w-48 bg-muted/50 rounded-lg" />
        <div className="h-4 w-72 bg-muted/50 rounded" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-7 w-12 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Link list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="h-5 w-32 bg-muted/50 rounded" />
          <div className="h-9 w-28 bg-muted/50 rounded-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-border/50 flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-56 bg-muted/50 rounded" />
              <div className="h-3 w-32 bg-muted/50 rounded" />
            </div>
            <div className="h-6 w-14 bg-muted/50 rounded-full" />
            <div className="w-8 h-8 bg-muted/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
