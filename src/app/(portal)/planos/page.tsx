import type { Metadata } from "next"
import { PlanosClient } from "./PlanosClient"

export const metadata: Metadata = {
  title: "Planos para Construtoras — Base Imob",
  description: "Gerencie empreendimentos, controle estoque e venda mais com inteligência. A plataforma que construtoras escolhem.",
}

export default function PlanosPage() {
  return <PlanosClient />
}
