"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Globe, ExternalLink, Users, Home, Phone, Building2,
  BadgeCheck, AlertCircle, Edit, CheckCircle, XCircle,
  MessageSquare, Link as LinkIcon,
} from "lucide-react"
import { OrgEditModal } from "@/components/dashboard/OrgEditModal"
import type { OrgWithStats } from "@/components/dashboard/OrgDetailList"
import type { OrgPlan } from "@/types/database"

const PLAN_LABEL: Record<OrgPlan, string> = {
  free: "Gratuito", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
}

const PLAN_COLOR: Record<OrgPlan, string> = {
  free:       "text-zinc-400 bg-zinc-800/60 border-zinc-700/40",
  starter:    "text-sky-400 bg-sky-900/20 border-sky-700/40",
  pro:        "text-violet-400 bg-violet-900/20 border-violet-700/40",
  enterprise: "text-gold bg-gold/10 border-gold/40",
}

const TYPE_PATH: Record<string, string> = {
  imobiliaria: "imobiliaria",
  construtora: "construtora",
}

type CorretorRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  creci: string | null
  whatsapp: string | null
  slug: string | null
  is_active: boolean
  role: string
}

interface Props {
  org: OrgWithStats
  onClose: () => void
}

export function OrgDetailPanel({ org, onClose }: Props) {
  const [corretores, setCorretores] = useState<CorretorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orgs/${org.id}`)
      .then((r) => r.json())
      .then((data) => { setCorretores(data.corretores ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [org.id])

  const minisiteUrl = org.slug ? `/${TYPE_PATH[org.type]}/${org.slug}` : null
  const activeCorretores = corretores.filter((c) => c.is_active)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-card border-l border-border flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-border flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
            {org.logo
              ? <Image src={org.logo} alt={org.name} width={44} height={44} className="object-contain p-1" />
              : <Building2 size={18} className="text-muted-foreground" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl font-bold text-foreground truncate">{org.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground/60 border border-border px-2 py-0.5 rounded-full">
                {org.type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${PLAN_COLOR[org.plan]}`}>
                {PLAN_LABEL[org.plan]}
              </span>
              {minisiteUrl && (
                <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-gold/60 hover:text-gold font-mono transition-colors">
                  <Globe size={9} />{minisiteUrl}<ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border m-6 rounded-xl overflow-hidden">
            {[
              { label: "Corretores ativos", value: activeCorretores.length, accent: "text-gold" },
              { label: "Total na equipe",   value: corretores.length,        accent: "text-foreground" },
              { label: "Imóveis",           value: org.imoveis,              accent: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="bg-card px-4 py-4 text-center">
                <p className={`font-serif text-3xl font-bold ${s.accent}`}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Main info */}
          <div className="px-6 space-y-4 mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans">Informações</p>

            {(org.portfolio_desc || org.about_text) && (
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                {org.about_text || org.portfolio_desc}
              </p>
            )}

            <div className="space-y-2">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-gold transition-colors">
                  <LinkIcon size={11} className="text-muted-foreground/40" />
                  {org.website}
                </a>
              )}
              {org.whatsapp && (
                <p className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                  <Phone size={11} className="text-muted-foreground/40" />
                  {org.whatsapp}
                </p>
              )}
              {org.hero_tagline && (
                <p className="flex items-center gap-2 text-xs font-sans text-muted-foreground italic">
                  <MessageSquare size={11} className="text-muted-foreground/40 flex-shrink-0" />
                  "{org.hero_tagline}"
                </p>
              )}
              {org.slug ? (
                <p className="flex items-center gap-2 text-xs font-mono text-gold/60">
                  <Globe size={11} className="text-muted-foreground/40" />
                  /{TYPE_PATH[org.type]}/{org.slug}
                </p>
              ) : (
                <p className="flex items-center gap-2 text-xs font-sans text-amber-500/70">
                  <AlertCircle size={11} />Minisite não publicado — sem slug definido
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border mx-6 mb-6" />

          {/* Corretores */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans flex items-center gap-1.5">
                <Users size={10} />
                Equipe — {corretores.length} membro{corretores.length !== 1 ? "s" : ""}
              </p>
              {activeCorretores.length < corretores.length && (
                <span className="text-[10px] font-sans text-muted-foreground/40">
                  {corretores.length - activeCorretores.length} inativo{corretores.length - activeCorretores.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-muted-foreground/30 text-xs font-sans">Carregando...</div>
            ) : corretores.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground/30 text-xs font-sans border border-dashed border-border rounded-xl">
                Nenhum membro vinculado.
              </div>
            ) : (
              <div className="space-y-2">
                {corretores.map((c) => (
                  <div key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      c.is_active ? "border-border bg-muted/20" : "border-border/40 bg-transparent opacity-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {c.avatar_url
                        ? <Image src={c.avatar_url} alt={c.full_name ?? ""} width={36} height={36} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="font-serif text-sm text-muted-foreground/50">{c.full_name?.[0]?.toUpperCase() ?? "?"}</span>
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-foreground/90 font-medium truncate">{c.full_name ?? "—"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-sans text-muted-foreground/50 capitalize">{c.role}</span>
                        {c.creci && (
                          <span className="flex items-center gap-0.5 text-[10px] font-sans text-gold/60">
                            <BadgeCheck size={9} />CRECI {c.creci}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground/30 hover:text-emerald-400 transition-colors"
                          title="WhatsApp"
                        >
                          <Phone size={13} />
                        </a>
                      )}
                      {c.slug && (
                        <a
                          href={`/corretor/${c.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground/30 hover:text-gold transition-colors"
                          title="Ver minisite"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {c.is_active
                        ? <CheckCircle size={13} className="text-emerald-400/60" />
                        : <XCircle size={13} className="text-muted-foreground/20" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-xl"
          >
            <Edit size={13} /> Editar Organização
          </button>
        </div>
      </motion.div>

      {/* Edit modal on top of panel */}
      <AnimatePresence>
        {showEdit && (
          <OrgEditModal org={org} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
