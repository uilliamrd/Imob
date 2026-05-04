// Rate limiting em memória — sem dependências externas
// Adequado para ambientes serverless com instâncias de longa duração (Vercel Pro/hobby).
// Limitação: o contador é por instância. Em múltiplas instâncias paralelas (escala horizontal),
// cada servidor tem seu próprio contador — um cliente pode atingir o limite em cada instância
// separadamente. Para produção com alto tráfego, migre para Upstash Redis.

interface RateLimitEntry {
  count: number
  resetAt: number // timestamp em ms de quando a janela atual expira
}

const store = new Map<string, RateLimitEntry>()

// Remove entradas expiradas a cada minuto para não acumular memória indefinidamente
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 60_000)

/**
 * Verifica e incrementa o contador de requisições para uma chave.
 *
 * @param identifier  Chave única — tipicamente IP ou user ID
 * @param limit       Número máximo de requisições permitidas na janela
 * @param windowSeconds  Duração da janela em segundos
 * @returns { success: true } se dentro do limite; { success: false } se excedeu
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  // Janela expirada ou primeira requisição: cria nova entrada
  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { success: true, remaining: limit - 1 }
  }

  // Dentro da janela: incrementa e verifica limite
  entry.count += 1
  const remaining = Math.max(0, limit - entry.count)

  if (entry.count > limit) {
    return { success: false, remaining: 0 }
  }

  return { success: true, remaining }
}
