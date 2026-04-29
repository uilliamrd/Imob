"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useToast, type ToastVariant } from "@/lib/toast-context"

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof CheckCircle2; className: string; iconColor: string }> = {
  success: { icon: CheckCircle2,   className: "border-emerald-500/30 bg-emerald-500/10", iconColor: "text-emerald-500" },
  error:   { icon: AlertCircle,    className: "border-red-500/30 bg-red-500/10",          iconColor: "text-red-500" },
  warning: { icon: AlertTriangle,  className: "border-amber-500/30 bg-amber-500/10",      iconColor: "text-amber-500" },
  info:    { icon: Info,           className: "border-[var(--gold)]/30 bg-[var(--gold)]/10", iconColor: "text-[var(--gold)]" },
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const { icon: Icon, className, iconColor } = VARIANT_STYLES[t.variant ?? "info"]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border bg-card shadow-xl shadow-black/10 ${className}`}
              role="alert"
            >
              <Icon size={16} className={`shrink-0 mt-0.5 ${iconColor}`} />
              <p className="flex-1 text-sm font-sans text-foreground leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Fechar notificação"
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
