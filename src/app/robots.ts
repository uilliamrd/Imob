import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/_next/", "/register", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
