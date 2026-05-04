// Ponto de entrada de instrumentação do Next.js (App Router).
// O Next.js chama register() uma vez ao iniciar o servidor.
// Aqui carregamos as configurações do Sentry para cada runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}
