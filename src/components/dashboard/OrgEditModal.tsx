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
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <h2 className="font-serif text-xl font-semibold text-white">Editar: {org.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground/70 transition-colors">
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
              plan: org.plan,
              subscription_status: org.subscription_status,
              subscription_expires_at: org.subscription_expires_at,
              payment_due_date: org.payment_due_date,
              highlight_quota: org.highlight_quota,
              super_highlight_quota: org.super_highlight_quota,
              is_section_highlighted: org.is_section_highlighted,
            }}
          />
        </div>
      </div>
    </div>
  )
}
