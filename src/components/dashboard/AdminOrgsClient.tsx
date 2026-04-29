"use client"

import { useState } from "react"
import Image from "next/image"
import { Building2, Edit, ExternalLink, Trash2 } from "lucide-react"
import { OrgEditModal } from "@/components/dashboard/OrgEditModal"
import type { Organization } from "@/types/database"

interface AdminOrgsClientProps {
  orgs: Organization[]
}

export function AdminOrgsClient({ orgs: initial }: AdminOrgsClientProps) {
  const [orgs, setOrgs] = useState(initial)
  const [editing, setEditing] = useState<Organization | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function deleteOrg(org: Organization) {
    if (!window.confirm(`Excluir "${org.name}"?\n\nIsso desvinculará todos os usuários desta organização. Imóveis vinculados NÃO serão excluídos. Esta ação não pode ser desfeita.`)) return
    setDeleting(org.id)
    setError(null)
    const res = await fetch(`/api/organizations/${org.id}`, { method: "DELETE" })
    if (res.ok) {
      setOrgs((prev) => prev.filter((o) => o.id !== org.id))
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao excluir.")
    }
    setDeleting(null)
  }

  return (
    <>
      {error && (
        <div className="mx-6 mb-3 px-4 py-2.5 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-xs font-sans">
          {error}
        </div>
      )}

      <div className="divide-y divide-border">
        {orgs.map((org) => (
          <div key={org.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-4">
              {org.logo ? (
                <Image src={org.logo} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-contain bg-muted/50 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Building2 size={16} className="text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-foreground/90 text-sm font-sans">{org.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wider font-sans">
                    {org.type}
                  </span>
                  {org.has_lancamentos && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-700/40 text-amber-400 bg-amber-900/10 uppercase tracking-wider font-sans">
                      Lançamentos
                    </span>
                  )}
                  {org.slug && (
                    <span className="text-muted-foreground/50 text-[10px] font-mono">/{org.type === "imobiliaria" ? "imobiliaria" : "construtora"}/{org.slug}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {org.slug && (
                <a href={`/${org.type === "imobiliaria" ? "imobiliaria" : "construtora"}/${org.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
              <button onClick={() => setEditing(org)}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors">
                <Edit size={14} />
              </button>
              <button
                onClick={() => deleteOrg(org)}
                disabled={deleting === org.id}
                className="p-2 rounded-lg border border-red-800/30 text-red-400/60 hover:text-red-400 hover:border-red-700/50 hover:bg-red-900/10 transition-colors disabled:opacity-40"
                title="Excluir organização"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {orgs.length === 0 && (
          <div className="px-6 py-6 text-center text-muted-foreground/50 font-sans text-sm">
            Nenhuma organização cadastrada.
          </div>
        )}
      </div>

      {editing && (
        <OrgEditModal org={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
