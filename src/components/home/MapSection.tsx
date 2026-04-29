import { MapPin } from "lucide-react"

export function MapSection() {
  return (
    <section id="mapa" className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-[400px] bg-muted rounded-2xl flex flex-col items-center justify-center gap-4 border border-border">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/10">
          <MapPin size={32} strokeWidth={1.5} className="text-[var(--gold)]" />
        </div>
        <div className="text-center">
          <p className="font-serif text-xl font-semibold text-foreground">Mapa em breve</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Visualize imóveis por localização interativa com filtros de bairro e raio.
          </p>
        </div>
      </div>
    </section>
  )
}
