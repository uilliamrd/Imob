export default function ImovelLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-40 border-b border-border px-6 py-4 flex items-center justify-between bg-background">
        <div className="h-4 w-24 rounded skeleton-luxury" />
        <div className="h-6 w-32 rounded skeleton-luxury" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Bento skeleton */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[520px]">
          <div className="col-span-2 row-span-2 rounded-xl skeleton-luxury" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl skeleton-luxury" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-3 w-32 rounded skeleton-luxury" />
            <div className="h-12 w-3/4 rounded skeleton-luxury" />
            <div className="h-3 w-40 rounded skeleton-luxury" />
            <div className="h-px w-20 skeleton-luxury" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl skeleton-luxury" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded skeleton-luxury" />
              <div className="h-4 w-5/6 rounded skeleton-luxury" />
              <div className="h-4 w-4/6 rounded skeleton-luxury" />
            </div>
          </div>
          {/* Right */}
          <div className="lg:col-span-1">
            <div className="h-64 rounded-2xl skeleton-luxury" />
          </div>
        </div>
      </div>
    </div>
  )
}
