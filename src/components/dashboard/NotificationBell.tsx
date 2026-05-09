"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Bell, X, CheckCheck } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/types/database"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "agora"
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

interface Props {
  userId: string
}

export function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null)
      .then(({ count }) => setUnread(count ?? 0))

    const channel = supabase
      .channel(`notif:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
        () => setUnread(prev => prev + 1),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const markAllRead = useCallback(async () => {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", userId)
      .is("read_at", null)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    setUnread(0)
  }, [userId])

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (!next) return

    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
    setNotifications((data ?? []) as Notification[])
    setLoading(false)

    if (unread > 0) markAllRead()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label="Notificações"
        className="relative w-9 h-9 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 hover:bg-muted/70 transition-all duration-200"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/70 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <p className="text-sm font-sans font-semibold text-foreground">Notificações</p>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-sans text-muted-foreground hover:text-[var(--gold)] transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
                  >
                    <CheckCheck size={11} /> Marcar lidas
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[360px]">
              {loading && (
                <div className="py-8 text-center text-muted-foreground text-xs font-sans">Carregando...</div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-xs font-sans">
                  Nenhuma notificação ainda
                </div>
              )}
              {!loading && notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/dashboard"}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/40 transition-colors last:border-0 ${!n.read_at ? "bg-[var(--gold)]/5" : ""}`}
                >
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!n.read_at ? "bg-[var(--gold)]" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-sans leading-snug ${!n.read_at ? "text-foreground font-medium" : "text-foreground/70"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-[11px] font-sans text-muted-foreground mt-0.5 truncate">{n.body}</p>
                    )}
                    <p className="text-[10px] font-sans text-muted-foreground/50 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
