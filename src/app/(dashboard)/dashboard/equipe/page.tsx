import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { requireAuth } from "@/lib/auth"
import { InviteTeamClient } from "@/components/dashboard/InviteTeamClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Users, User } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", imobiliaria: "Imobiliária", corretor: "Corretor", construtora: "Construtora",
}
const ROLE_COLORS: Record<string, string> = {
  admin: "text-red-400 bg-red-900/20 border-red-800/40",
  imobiliaria: "text-blue-400 bg-blue-900/20 border-blue-800/40",
  corretor: "text-emerald-400 bg-emerald-900/20 border-emerald-800/40",
  construtora: "text-amber-400 bg-amber-900/20 border-amber-800/40",
}

export default async function EquipePage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora"])
  const supabase = await createClient()

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: members } = myProfile?.organization_id
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, whatsapp, creci")
        .eq("organization_id", myProfile.organization_id)
        .order("role")
    : { data: [] }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-4xl">
      <PageHeader
        icon={Users}
        category="Organização"
        title="Equipe"
        badge={`${members?.length ?? 0} membros`}
      />

      {/* Invite */}
      {myProfile?.organization_id && (
        <div className="mb-8">
          <InviteTeamClient orgId={myProfile.organization_id} />
        </div>
      )}

      {!myProfile?.organization_id && (
        <div className="bg-card border border-gold/10 rounded-2xl p-6 mb-8">
          <p className="text-muted-foreground font-sans text-sm">
            Você ainda não está vinculado a uma organização.{" "}
            <a href="/dashboard/organizacao" className="text-gold hover:text-gold-light transition-colors">
              Criar ou entrar em uma organização →
            </a>
          </p>
        </div>
      )}

      {/* Members list */}
      <div className="bg-card border border-border rounded-2xl divide-y divide-white/5">
        {(members ?? []).map((m) => (
          <div key={m.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-shrink-0">
              {m.avatar_url ? (
                <Image src={m.avatar_url} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground/90 text-sm font-sans font-medium truncate">
                {m.full_name ?? "Sem nome"}
                {m.id === user.id && <span className="text-gold/50 text-xs ml-2">(você)</span>}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                {m.creci && (
                  <span className="text-muted-foreground text-xs font-sans">CRECI {m.creci}</span>
                )}
                {m.whatsapp && (
                  <a href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground/50 text-xs font-sans hover:text-gold transition-colors">
                    {m.whatsapp}
                  </a>
                )}
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans flex-shrink-0 ${ROLE_COLORS[m.role] ?? "border-border text-muted-foreground"}`}>
              {ROLE_LABELS[m.role] ?? m.role}
            </span>
          </div>
        ))}

        {(!members || members.length === 0) && (
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface elevation-soft">
              <Users size={20} strokeWidth={1.25} className="text-muted-foreground/50" />
            </div>
            <p className="font-serif text-base font-semibold text-foreground">Nenhum membro ainda</p>
            <p className="text-sm text-muted-foreground">Convide corretores usando o formulário acima.</p>
          </div>
        )}
      </div>
    </div>
  )
}
