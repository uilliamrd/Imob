import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baseimob.com.br"
  return {
    rules: [
      {
        userAgent: "*",
        // LPs públicas via link direto devem ser indexáveis
        allow: [
          "/empreendimentos/",
          "/construtora/",
          "/imobiliaria/",
          "/corretor/",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
