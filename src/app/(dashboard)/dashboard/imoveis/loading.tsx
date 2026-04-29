export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 bg-muted/50 rounded-lg" />
        <div className="h-9 w-36 bg-muted/50 rounded-lg" />
      </div>

      {/* Table rows */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex gap-4">
          <div className="h-4 w-8 bg-muted/50 rounded" />
          <div className="h-4 flex-1 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted/50 rounded" />
          <div className="h-4 w-24 bg-muted/50 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-white/[0.03] flex items-center gap-4">
            <div className="w-14 h-10 bg-muted/50 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 bg-muted/50 rounded" />
              <div className="h-3 w-28 bg-muted/50 rounded" />
            </div>
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-6 w-20 bg-muted/50 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
