import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { Database, FileText, RefreshCw, AlertTriangle, CheckCircle, Clock, Webhook } from "lucide-react"
import { CopyButton } from "@/components/ui/CopyButton"
import type { IngestLog } from "@/types/database"

function formatDate(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return "Agora há pouco"
  if (diffH < 24) return `Hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return `Ontem, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
    `, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
}

export default async function DataCenterPage() {
  await requireAuth(["admin"])
  const supabase = createAdminClient()

  const { data: logs } = await supabase
    .from("ingest_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  const allLogs = (logs ?? []) as IngestLog[]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLogs = allLogs.filter((l) => new Date(l.created_at) >= today)
  const totalSuccess = allLogs.filter((l) => l.status === "success").length
  const totalError = allLogs.filter((l) => l.status === "error").length
  const totalRows = allLogs.reduce((a, l) => a + l.rows_processed, 0)

  const ingestEndpoint = "/api/properties/ingest"

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Database size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Data Center</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Logs de importação via n8n, histórico de versões de tabelas PDF e ferramentas de correção de dados.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Importações hoje",     value: String(todayLogs.length), icon: FileText,     color: "text-gold" },
          { label: "Com sucesso",          value: String(totalSuccess),     icon: CheckCircle,  color: "text-emerald-400" },
          { label: "Com erro",             value: String(totalError),       icon: AlertTriangle,color: "text-red-400" },
          { label: "Registros importados", value: String(totalRows),        icon: RefreshCw,    color: "text-blue-400" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={s.color} />
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Webhook config */}
      <div className="bg-card border border-border rounded-2xl mb-6">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <Webhook size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-semibold text-white">Webhook n8n</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5">
              Endpoint de Ingestão
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={ingestEndpoint}
                className="flex-1 bg-muted/50 border border-border text-muted-foreground px-3 py-2.5 rounded-lg font-sans text-sm font-mono"
              />
              <CopyButton value={ingestEndpoint} label="Copiar" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5">
              Token de Autenticação
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value="••••••••••••••••••••"
                type="password"
                className="flex-1 bg-muted/50 border border-border text-muted-foreground px-3 py-2.5 rounded-lg font-sans text-sm"
              />
              <span className="px-4 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
                Definido em .env
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Histórico de Importações</h2>
          </div>
          <span className="text-muted-foreground/50 text-xs font-sans">{allLogs.length} registros</span>
        </div>

        {allLogs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground/50 font-sans text-sm">
            Nenhuma importação registrada ainda. Configure o n8n e faça o primeiro envio.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {allLogs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/80 text-sm font-sans truncate">{log.message}</p>
                  <p className="text-muted-foreground/50 text-xs font-sans mt-0.5">{formatDate(log.created_at)}</p>
                </div>
                {log.rows_processed > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-muted-foreground text-xs font-sans">{log.rows_processed} processados</p>
                    {log.rows_created > 0 && (
                      <p className="text-emerald-400/50 text-xs font-sans">+{log.rows_created} criados</p>
                    )}
                    {log.rows_updated > 0 && (
                      <p className="text-blue-400/50 text-xs font-sans">↻{log.rows_updated} atualizados</p>
                    )}
                  </div>
                )}
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  log.status === "success"
                    ? "bg-emerald-900/20 text-emerald-400 border-emerald-700/30"
                    : "bg-red-900/20 text-red-400 border-red-700/30"
                }`}>
                  {log.status === "success" ? "OK" : "Erro"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

