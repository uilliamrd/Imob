"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { OrgForm } from "@/components/dashboard/OrgForm"
import type { Organization } from "@/types/database"

interface OrgEditModalProps {
  org: Organization
  onClose: () => void
}

export function OrgEditModal({ org, onClose }: OrgEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <h2 className="font-serif text-xl font-semibold text-white">Editar: {org.name}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <OrgForm
            userId=""
            orgId={org.id}
            isAdmin={true}
            initialData={{
              name: org.name,
              type: org.type,
              portfolio_desc: org.portfolio_desc ?? "",
              about_text: org.about_text ?? "",
              about_image: org.about_image ?? "",
              hero_tagline: org.hero_tagline ?? "",
              hero_image: org.hero_image ?? "",
              website: org.website ?? "",
              logo: org.logo ?? "",
              has_lancamentos: org.has_lancamentos ?? false,
              slug: org.slug ?? "",
            }}
          />
        </div>
      </div>
    </div>
  )
}
