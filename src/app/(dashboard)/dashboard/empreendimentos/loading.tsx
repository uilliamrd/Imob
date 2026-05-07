export default function Loading() {
  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl animate-pulse">
      {/* PageHeader */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted/50 rounded" />
        <div className="h-8 w-48 bg-muted/50 rounded-lg" />
        <div className="h-4 w-80 bg-muted/50 rounded" />
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <div className="w-4 h-4 bg-muted/50 rounded" />
          <div className="h-5 w-40 bg-muted/50 rounded" />
          <div className="ml-auto h-3 w-20 bg-muted/50 rounded" />
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
          <div className="h-9 w-64 bg-muted/50 rounded-lg" />
          <div className="h-9 w-36 bg-muted/50 rounded-lg" />
        </div>

        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-border/50 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted/50 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 bg-muted/50 rounded" />
              <div className="h-3 w-32 bg-muted/50 rounded" />
            </div>
            <div className="h-6 w-20 bg-muted/50 rounded-full" />
            <div className="h-3 w-16 bg-muted/50 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-muted/50 rounded-lg" />
              <div className="w-8 h-8 bg-muted/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
