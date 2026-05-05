import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// ─── Security headers (sem CSP) ───────────────────────────────────────────────
// O Content-Security-Policy é gerado por request no proxy.ts com nonce único.
// Aqui ficam apenas os headers estáticos que não precisam de nonce.
// ──────────────────────────────────────────────────────────────────────────────
const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
]

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "file-type"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      // Imagens externas usadas em propriedades e perfis
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "*.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Organização e projeto configurados via variáveis de ambiente SENTRY_ORG e SENTRY_PROJECT
  silent: true, // Suprime logs do Sentry durante o build

  // Upload de source maps apenas em CI/CD (quando SENTRY_AUTH_TOKEN estiver definido).
  // Sem o token, source maps não são enviados ao Sentry nem expostos ao cliente.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
