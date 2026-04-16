export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-8 w-36 bg-muted/50 rounded-lg mb-8" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 w-24 bg-muted/50 rounded" />
            <div className="h-8 w-16 bg-muted/50 rounded" />
            <div className="h-3 w-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="h-4 w-32 bg-muted/50 rounded mb-6" />
        <div className="h-48 bg-white/[0.03] rounded-xl" />
      </div>

      {/* Second chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="h-4 w-40 bg-muted/50 rounded mb-6" />
        <div className="h-40 bg-white/[0.03] rounded-xl" />
      </div>
    </div>
  )
}
