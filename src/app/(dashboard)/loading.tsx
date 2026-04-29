export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      {/* Sidebar skeleton */}
      <aside className="w-64 min-h-screen bg-[#111111] border-r border-white/5 flex flex-col p-6 gap-4">
        <div className="h-8 w-32 rounded skeleton-luxury mb-4" />
        <div className="h-10 w-full rounded-lg skeleton-luxury mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-full rounded-lg skeleton-luxury" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </aside>
      {/* Content skeleton */}
      <main className="flex-1 p-8 space-y-6">
        <div className="h-5 w-40 rounded skeleton-luxury" />
        <div className="h-10 w-64 rounded skeleton-luxury" />
        <div className="h-px w-20 skeleton-luxury" />
        <div className="grid grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl skeleton-luxury" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-luxury" />
          ))}
        </div>
      </main>
    </div>
  )
}
