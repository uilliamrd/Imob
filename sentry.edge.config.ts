// Sentry — configuração para Edge Runtime (Middleware do Next.js)
// O Edge Runtime é usado pelo middleware de autenticação/proxy.
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Edge runtime tem restrições de CPU — mantém sample rate baixo
  tracesSampleRate: 0.05,

  enabled: process.env.NODE_ENV === "production",
})
