import {
  Waves,
  Gem,
  TreePine,
  Car,
  Sofa,
  Sun,
  Dumbbell,
  Utensils,
  Shield,
  Wifi,
  Building2,
  Star,
  Home,
  MapPin,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const TAG_MAP: Record<string, { icon: LucideIcon; label: string }> = {
  VM: { icon: Waves, label: "Vista Mar" },
  MD: { icon: Gem, label: "Mobiliado" },
  VV: { icon: TreePine, label: "Vista Verde" },
  VG: { icon: Car, label: "Vagas Garantidas" },
  AL: { icon: Sofa, label: "Alto Luxo" },
  SC: { icon: Sun, label: "Sol da Manhã" },
  FT: { icon: Dumbbell, label: "Fitness" },
  GR: { icon: Utensils, label: "Gourmet" },
  SG: { icon: Shield, label: "Segurança 24h" },
  SM: { icon: Wifi, label: "Smart Home" },
  CB: { icon: Building2, label: "Cobertura" },
  DX: { icon: Star, label: "Duplex" },
  PT: { icon: Home, label: "Penthouse" },
  PN: { icon: MapPin, label: "Planta Nobre" },
}

export function getTagInfo(tag: string) {
  return TAG_MAP[tag.toUpperCase()] ?? { icon: Star, label: tag }
}

export function getAllTags() {
  return TAG_MAP
}
