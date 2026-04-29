import Link from "next/link"
import { MapPin, Phone, Globe } from "lucide-react"

interface FooterProps {
  orgName: string
  website?: string | null
  whatsapp?: string
  address?: string
}

export function Footer({ orgName, website, whatsapp, address }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/50 font-sans mb-2">
              RealState Intelligence
            </p>
            <h3 className="font-serif text-2xl font-bold text-white mb-4">{orgName}</h3>
            <div className="divider-gold w-12" />
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans mb-5">Contato</p>
            <div className="space-y-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/50 hover:text-gold transition-colors text-sm font-sans"
                >
                  <Phone size={14} className="text-gold/50" />
                  {whatsapp}
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/50 hover:text-gold transition-colors text-sm font-sans"
                >
                  <Globe size={14} className="text-gold/50" />
                  {website.replace(/https?:\/\//, "")}
                </a>
              )}
              {address && (
                <p className="flex items-center gap-3 text-white/50 text-sm font-sans">
                  <MapPin size={14} className="text-gold/50 flex-shrink-0" />
                  {address}
                </p>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans mb-5">Plataforma</p>
            <div className="space-y-3">
              {[
                { href: "/login", label: "Área do Corretor" },
                { href: "/register", label: "Cadastre-se" },
                { href: "#unidades", label: "Ver Unidades" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/50 hover:text-gold transition-colors text-sm font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-gold opacity-20 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-sans">
            © {year} {orgName}. Todos os direitos reservados.
          </p>
          <p className="text-white/10 text-xs font-sans">
            Powered by{" "}
            <span className="text-gold/40">RealState Intelligence</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
