import type { Property, Organization, Development } from "@/types/database"

export interface PortalProperty extends Omit<Property, "organization" | "development"> {
  organization: Pick<Organization, "id" | "name" | "slug" | "type" | "logo" | "brand_colors"> | null
  development: Pick<Development, "id" | "name"> | null
}

export interface PortalOrg {
  id: string
  name: string
  slug: string
  logo: string | null
  brand_colors: { primary?: string } | null
  hero_tagline: string | null
  availableCount: number
}
