export default function Loading() {
  return (
    <div className="px-4 py-6 lg:p-8 max-w-2xl space-y-8 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-muted/50 rounded" />
        <div className="h-8 w-40 bg-muted/50 rounded-lg" />
      </div>

      {/* Profile form card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="h-5 w-32 bg-muted/50 rounded pb-2" />

        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted/50 rounded" />
            <div className="h-3 w-40 bg-muted/50 rounded" />
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted/50 rounded" />
              <div className="h-11 w-full bg-muted/50 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="h-10 w-full bg-muted/50 rounded-lg" />
      </div>

      {/* Password form card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="h-5 w-40 bg-muted/50 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted/50 rounded" />
          <div className="h-11 w-full bg-muted/50 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted/50 rounded" />
              <div className="h-11 w-full bg-muted/50 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-10 w-full bg-muted/50 rounded-lg" />
      </div>
    </div>
  )
}
