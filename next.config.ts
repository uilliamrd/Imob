import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co"

// ─── Content-Security-Policy ──────────────────────────────────────────────────
//
// script-src em produção usa HASH em vez de 'unsafe-inline':
//   O único script inline do app é o detector de tema em src/app/layout.tsx
//   (previne flash de conteúdo não estilizado antes do primeiro render).
//   O hash 'sha256-...' abaixo corresponde exatamente àquele trecho.
//   Se o script de layout.tsx for alterado, recalcule com:
//     node -e "const c=require('crypto');console.log(c.createHash('sha256').update('<conteúdo>').digest('base64'))"
//
//   JsonLd.tsx usa <script type="application/ld+json"> — não é JavaScript
//   executável, portanto não cai sob script-src (especificação CSP Level 3).
//
// style-src mantém 'unsafe-inline' — React renderiza style={{ }} como
//   style="..." no HTML (atributo inline), o que é controlado por este
//   diretivo. Remover exigiria eliminar todos os estilos inline do app.
//
// Em desenvolvimento: 'unsafe-inline' e 'unsafe-eval' são necessários
//   para o Hot Module Replacement (HMR) do Next.js funcionar.
// ──────────────────────────────────────────────────────────────────────────────
// TEMPORÁRIO: unsafe-inline reativado para desbloquear login (Supabase Auth injeta
// scripts inline não cobertos pelo hash). TODO: mapear os hashes dos scripts do
// Supabase Auth e substituir por hashes específicos.
// Hash original do script de tema (FOUC): 'sha256-2luk6C6MrBkgMUZRQQfFs/GvuPyNPqPmnLH1xLNKce8='

const isDev = process.env.NODE_ENV === "development"
const csp = [
  "default-src 'self'",
  // unsafe-inline necessário temporariamente: Supabase Auth injeta scripts inline
  // no PKCE flow. Substituir por hashes específicos após identificá-los.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // unsafe-inline obrigatório: React inline styles (style={{ }}) viram style="" no HTML
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.supabase.co wss://*.supabase.co`,
  "font-src 'self' data:",
  "frame-src 'self'",
  // Impede que o site seja carregado em iframe por outros domínios (proteção clickjacking)
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // DENY seria mais restritivo, mas SAMEORIGIN permite iframes internos (ex: previews)
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Desabilita APIs do browser que o app não utiliza
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Permite prefetch de DNS (melhora performance sem custo de segurança)
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Content-Security-Policy",   value: csp },
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
