import type { MetadataRoute } from "next"
import { createAdminClient } from "@/lib/supabase/admin"

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()

  const [
    { data: properties },
    { data: construtoras },
    { data: imobiliarias },
    { data: corretores },
    { data: developments },
  ] = await Promise.all([
    admin
      .from("properties")
      .select("slug, updated_at")
      .eq("visibility", "publico")
      .eq("status", "disponivel"),
    admin
      .from("organizations")
      .select("slug, updated_at")
      .eq("type", "construtora")
      .not("slug", "is", null),
    admin
      .from("organizations")
      .select("slug, updated_at")
      .eq("type", "imobiliaria")
      .not("slug", "is", null),
    admin
      .from("profiles")
      .select("id, slug, updated_at")
      .eq("role", "corretor")
      .eq("is_active", true),
    admin
      .from("developments")
      .select("id, updated_at"),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/construtoras`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/imobiliarias`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/corretores`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/sobre`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/venda`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${BASE}/imovel/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }))

  const construtoraPages: MetadataRoute.Sitemap = (construtoras ?? []).map((o) => ({
    url: `${BASE}/construtora/${o.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const imobiliariaPages: MetadataRoute.Sitemap = (imobiliarias ?? []).map((o) => ({
    url: `${BASE}/imobiliaria/${o.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const corretorPages: MetadataRoute.Sitemap = (corretores ?? []).map((c) => ({
    url: `${BASE}/corretor/${c.slug ?? c.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const lancamentoPages: MetadataRoute.Sitemap = (developments ?? []).map((d) => ({
    url: `${BASE}/lancamento/${d.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...propertyPages,
    ...construtoraPages,
    ...imobiliariaPages,
    ...corretorPages,
    ...lancamentoPages,
  ]
}
