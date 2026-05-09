"use client"

import { useState } from "react"
import { Bell, BellOff } from "lucide-react"
import { useToast } from "@/lib/toast-context"

interface Props {
  userId: string
  initialValue: boolean
}

export function NotificationPrefsForm({ userId, initialValue }: Props) {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const next = !enabled
    setSaving(true)
    const res = await fetch(`/api/profiles/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notif_new_property: next }),
    })
    setSaving(false)
    if (!res.ok) {
      toast("Erro ao salvar preferência", "error")
      return
    }
    setEnabled(next)
    toast(next ? "Notificações ativadas" : "Notificações desativadas", "success")
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-sans font-semibold text-foreground mb-0.5">Notificações</h3>
        <p className="text-xs font-sans text-muted-foreground">Controle quais alertas você recebe no sistema.</p>
      </div>

      <button
        onClick={toggle}
        disabled={saving}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          {enabled
            ? <Bell size={15} className="text-[var(--primary-default)]" />
            : <BellOff size={15} className="text-muted-foreground/50" />
          }
          <div className="text-left">
            <p className="text-sm font-sans font-medium text-foreground">Novos imóveis de construtoras</p>
            <p className="text-[11px] font-sans text-muted-foreground mt-0.5">
              Receba uma notificação quando uma construtora cadastrar ou recolocar um imóvel à venda.
            </p>
          </div>
        </div>
        <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-3 ${enabled ? "bg-[var(--primary-default)]" : "bg-muted-foreground/20"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-1"}`} />
        </div>
      </button>
    </div>
  )
}
