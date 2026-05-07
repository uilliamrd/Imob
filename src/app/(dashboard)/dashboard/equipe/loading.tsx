export default function Loading() {
  return (
    <div className="px-4 py-6 lg:p-8 max-w-4xl animate-pulse">
      {/* PageHeader */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted/50 rounded" />
        <div className="h-8 w-36 bg-muted/50 rounded-lg" />
        <div className="h-4 w-64 bg-muted/50 rounded" />
      </div>

      {/* Invite card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
        <div className="h-5 w-32 bg-muted/50 rounded" />
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-muted/50 rounded-lg" />
          <div className="h-10 w-28 bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Team members */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="h-5 w-28 bg-muted/50 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-border/50 flex items-center gap-4">
            <div className="w-10 h-10 bg-muted/50 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-muted/50 rounded" />
              <div className="h-3 w-24 bg-muted/50 rounded" />
            </div>
            <div className="h-5 w-20 bg-muted/50 rounded-full" />
            <div className="w-8 h-8 bg-muted/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
