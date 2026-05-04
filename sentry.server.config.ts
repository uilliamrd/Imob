// Sentry — configuração do lado do servidor (Node.js / Route Handlers / Server Components)
// Este arquivo é carregado automaticamente pelo Next.js no servidor.
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Percentual de transações de servidor enviadas para performance.
  tracesSampleRate: 0.1,

  // Não envia eventos em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",
})
