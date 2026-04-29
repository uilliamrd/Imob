"use client"

import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/premium/EmptyState"
import type { LucideIcon } from "lucide-react"

export interface Column<T = Record<string, unknown>> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

interface PaginationProps {
  page: number
  total: number
  perPage: number
  onChange: (page: number) => void
}

interface Props<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyState?: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
  }
  actions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  pagination?: PaginationProps
  className?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton-luxury h-3.5 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyState,
  actions,
  onRowClick,
  pagination,
  className,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [openActionRow, setOpenActionRow] = useState<number | null>(null)

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      const cmp = String(va).localeCompare(String(vb), "pt-BR", { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1
  const colCount = columns.length + (actions ? 1 : 0)

  return (
    <div className={cn("bg-card rounded-2xl overflow-hidden elevation-soft border border-border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-sans font-medium whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === "asc"
                          ? <ChevronUp size={12} className="text-[var(--gold)]" />
                          : <ChevronDown size={12} className="text-[var(--gold)]" />
                        : <ChevronsUpDown size={12} className="text-muted-foreground/40" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-sans font-medium w-12">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  {emptyState ? (
                    <EmptyState
                      icon={emptyState.icon}
                      title={emptyState.title}
                      description={emptyState.description}
                      action={emptyState.action}
                      compact
                    />
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-10 font-sans">
                      Nenhum resultado encontrado.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              sorted.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={cn(
                    "border-b border-border/60 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/30",
                    !onRowClick && "hover:bg-muted/20"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-foreground/80 font-sans">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenActionRow(openActionRow === rowIdx ? null : rowIdx)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openActionRow === rowIdx && (
                          <div
                            className="absolute right-0 top-full mt-1 z-20 min-w-[140px] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                            onMouseLeave={() => setOpenActionRow(null)}
                          >
                            {actions(row)}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-sans">
            Página {pagination.page} de {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => pagination.onChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-40 disabled:pointer-events-none transition-colors font-sans"
            >
              Anterior
            </button>
            <button
              onClick={() => pagination.onChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-40 disabled:pointer-events-none transition-colors font-sans"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
