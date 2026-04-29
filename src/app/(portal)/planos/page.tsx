import type { Metadata } from "next"
import { PlanosClient } from "./PlanosClient"

export const metadata: Metadata = {
  title: "Planos e Preços — Base Imob",
  description: "Escolha o plano ideal para sua imobiliária, construtora ou corretor autônomo. Compare recursos e preços.",
}

export default function PlanosPage() {
  return <PlanosClient />
}
