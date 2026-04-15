import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { InviteTeamClient } from "@/components/dashboard/InviteTeamClient"
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
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Organização</p>
          <h1 className="font-serif text-4xl font-bold text-white">
            <AnimatedGradientText className="font-serif text-4xl font-bold">Equipe</AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-4 w-20" />
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <Users size={16} />
          <span className="text-sm font-sans">{members?.length ?? 0} membros</span>
        </div>
      </div>

      {/* Invite */}
      {myProfile?.organization_id && (
        <div className="mb-8">
          <InviteTeamClient orgId={myProfile.organization_id} />
        </div>
      )}

      {!myProfile?.organization_id && (
        <div className="bg-[#161616] border border-gold/10 rounded-2xl p-6 mb-8">
          <p className="text-white/50 font-sans text-sm">
            Você ainda não está vinculado a uma organização.{" "}
            <a href="/dashboard/organizacao" className="text-gold hover:text-gold-light transition-colors">
              Criar ou entrar em uma organização →
            </a>
          </p>
        </div>
      )}

      {/* Members list */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl divide-y divide-white/5">
        {(members ?? []).map((m) => (
          <div key={m.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-shrink-0">
              {m.avatar_url ? (
                <Image src={m.avatar_url} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <User size={16} className="text-white/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-sm font-sans font-medium truncate">
                {m.full_name ?? "Sem nome"}
                {m.id === user.id && <span className="text-gold/50 text-xs ml-2">(você)</span>}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                {m.creci && (
                  <span className="text-white/30 text-xs font-sans">CRECI {m.creci}</span>
                )}
                {m.whatsapp && (
                  <a href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white/20 text-xs font-sans hover:text-gold transition-colors">
                    {m.whatsapp}
                  </a>
                )}
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans flex-shrink-0 ${ROLE_COLORS[m.role] ?? "border-white/10 text-white/30"}`}>
              {ROLE_LABELS[m.role] ?? m.role}
            </span>
          </div>
        ))}

        {(!members || members.length === 0) && (
          <div className="px-6 py-12 text-center">
            <Users size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/20 font-sans text-sm">Nenhum membro na equipe ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
