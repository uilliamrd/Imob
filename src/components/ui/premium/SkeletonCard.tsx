import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  /** Show image placeholder at the top */
  image?: boolean
  /** Number of text line skeletons in the body */
  lines?: number
  className?: string
}

function SkeletonLine({ width = "full", className }: { width?: string; className?: string }) {
  return (
    <div
      className={cn(
        "h-3 rounded-full skeleton-luxury",
        width === "full" ? "w-full" : `w-[${width}]`,
        className
      )}
    />
  )
}

export function SkeletonCard({ image = true, lines = 3, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-card border border-border elevation-soft",
        className
      )}
      aria-hidden="true"
    >
      {image && (
        <div className="aspect-[4/3] w-full skeleton-luxury" />
      )}

      <div className="flex flex-col gap-3 p-4">
        <SkeletonLine />
        <SkeletonLine width="75%" />
        {lines > 2 && <SkeletonLine width="50%" />}
        {lines > 3 && <SkeletonLine width="60%" />}

        <div className="mt-1 flex gap-3">
          <SkeletonLine width="30%" />
          <SkeletonLine width="30%" />
          <SkeletonLine width="25%" />
        </div>

        <div className="mt-1">
          <div className="h-5 w-32 rounded-full skeleton-luxury" />
        </div>
      </div>
    </div>
  )
}

/** Render N skeleton cards in a responsive grid */
export function SkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
