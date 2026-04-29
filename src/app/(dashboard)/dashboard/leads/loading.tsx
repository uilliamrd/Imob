export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-8 w-32 bg-muted/50 rounded-lg mb-8" />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-7 w-12 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Lead rows */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-white/[0.03] flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-muted/50 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-muted/50 rounded" />
              <div className="h-3 w-56 bg-muted/50 rounded" />
            </div>
            <div className="h-3 w-24 bg-muted/50 rounded" />
            <div className="h-3 w-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
