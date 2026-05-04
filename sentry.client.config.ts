// Sentry — configuração do lado do cliente (browser)
// Este arquivo é carregado automaticamente pelo Next.js antes do app iniciar.
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Percentual de transações enviadas para rastreamento de performance.
  // 0.1 = 10% — reduz volume sem perder visibilidade.
  tracesSampleRate: 0.1,

  // Em produção, reduz o volume de replays de sessão para economizar cota.
  replaysOnErrorSampleRate: 1.0,  // 100% das sessões com erro
  replaysSessionSampleRate: 0.05, // 5% das sessões normais

  integrations: [
    Sentry.replayIntegration({
      // Mascara dados sensíveis automaticamente
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Não envia eventos em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",
})
