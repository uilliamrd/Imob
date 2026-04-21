import { AlertTriangle } from "lucide-react"

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-800/30 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-3">Acesso Suspenso</h1>
          <p className="text-white/50 font-sans text-sm leading-relaxed">
            Sua assinatura está com pagamento em atraso. O acesso ao painel foi temporariamente suspenso.
          </p>
          <p className="text-white/30 font-sans text-xs mt-3">
            Entre em contato com o suporte para regularizar sua situação e restaurar o acesso.
          </p>
        </div>
        <a
          href="https://wa.me/5521999999999"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg font-medium"
        >
          Falar com Suporte
        </a>
      </div>
    </div>
  )
}
