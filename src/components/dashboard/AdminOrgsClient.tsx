"use client"

import { useState } from "react"
import { Building2, Edit, ExternalLink } from "lucide-react"
import { OrgEditModal } from "@/components/dashboard/OrgEditModal"
import type { Organization } from "@/types/database"

interface AdminOrgsClientProps {
  orgs: Organization[]
}

export function AdminOrgsClient({ orgs }: AdminOrgsClientProps) {
  const [editing, setEditing] = useState<Organization | null>(null)

  return (
    <>
      <div className="divide-y divide-white/5">
        {orgs.map((org) => (
          <div key={org.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              {org.logo ? (
                <img src={org.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Building2 size={16} className="text-white/30" />
                </div>
              )}
              <div>
                <p className="text-white/90 text-sm font-sans">{org.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 uppercase tracking-wider font-sans">
                    {org.type}
                  </span>
                  {org.has_lancamentos && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-700/40 text-amber-400 bg-amber-900/10 uppercase tracking-wider font-sans">
                      Lançamentos
                    </span>
                  )}
                  {org.slug && (
                    <span className="text-white/20 text-[10px] font-mono">/construtora/{org.slug}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {org.slug && (
                <a href={`/construtora/${org.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-gold hover:border-gold/30 transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
              <button onClick={() => setEditing(org)}
                className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-gold hover:border-gold/30 transition-colors">
                <Edit size={14} />
              </button>
            </div>
          </div>
        ))}
        {orgs.length === 0 && (
          <div className="px-6 py-6 text-center text-white/20 font-sans text-sm">
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
