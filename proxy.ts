import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"

  // Resolve Supabase host inside the function so the env var is read at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "*.supabase.co"

  const csp = [
    "default-src 'self'",
    // nonce cobre todos os scripts inline; strict-dynamic permite que
    // scripts com nonce carreguem outros scripts dinamicamente (chunks Next.js)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // unsafe-inline obrigatório: React transforma style={{ }} em style="" no HTML
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:",
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.supabase.co wss://*.supabase.co`,
    "font-src 'self' data:",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set("Content-Security-Policy", csp)

  return response
}

export const config = {
  matcher: [
    {
      // Executa em todas as rotas exceto assets estáticos e prefetches
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
