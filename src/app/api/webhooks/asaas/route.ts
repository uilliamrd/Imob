import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import * as Sentry from "@sentry/nextjs"

export const dynamic = "force-dynamic"

interface AsaasEvent {
  event: string
  payment?: {
    id: string
    customer: string
    subscription?: string
    value: number
    status: string
    externalReference?: string
  }
  subscription?: {
    id: string
    customer: string
    status: string
    externalReference?: string
  }
}

function parseExternalRef(ref: string) {
  // Formato plan: "plan:{plan}:org:{orgId}:entity:{entityType}"
  // Formato upsell: "highlight:{recordId}" ou "boost:{recordId}"
  const planMatch = ref.match(/^plan:(\w+):org:([\w-]+):entity:(\w+)$/)
  if (planMatch) return { type: "plan", plan: planMatch[1], orgId: planMatch[2], entityType: planMatch[3] }
  const upsellMatch = ref.match(/^(highlight|boost):([\w-]+)$/)
  if (upsellMatch) return { type: "upsell", upsellType: upsellMatch[1], recordId: upsellMatch[2] }
  return null
}

export async function POST(req: NextRequest) {
  // Validação obrigatória do token Asaas
  // Sem a variável configurada, a rota rejeita tudo — evita processar eventos falsos
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN
  const receivedToken = req.headers.get("asaas-access-token")
  if (!expectedToken || receivedToken !== expectedToken) {
    Sentry.captureMessage("Webhook Asaas: token inválido ou ausente", {
      level: "warning",
      extra: {
        path: req.nextUrl.pathname,
        method: req.method,
        ip: req.headers.get("x-forwarded-for") ?? "unknown",
        hasToken: !!receivedToken,
        envConfigured: !!expectedToken,
      },
    })
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as AsaasEvent | null
  if (!body?.event) return NextResponse.json({ error: "Evento inválido" }, { status: 400 })

  const admin = createAdminClient()

  switch (body.event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED": {
      const payment = body.payment
      if (!payment?.externalReference) break

      const ref = parseExternalRef(payment.externalReference)
      if (!ref) break

      if (ref.type === "plan" && ref.orgId) {
        await admin.from("organizations").update({
          subscription_status:   "active",
          asaas_subscription_id: payment.subscription ?? null,
        }).eq("id", ref.orgId)
      }

      if (ref.type === "upsell" && ref.recordId) {
        if (ref.upsellType === "highlight") {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)
          await admin.from("property_highlights").update({
            status:     "ativo",
            expires_at: expiresAt.toISOString(),
          }).eq("id", ref.recordId)
        } else {
          const { data: record } = await admin
            .from("property_boosts")
            .select("duracao_dias")
            .eq("id", ref.recordId)
            .single()
          const days = record?.duracao_dias ?? 7
          const now = new Date()
          const expiresAt = new Date(now)
          expiresAt.setDate(expiresAt.getDate() + days)
          await admin.from("property_boosts").update({
            status:     "ativo",
            starts_at:  now.toISOString(),
            expires_at: expiresAt.toISOString(),
          }).eq("id", ref.recordId)
        }
      }
      break
    }

    case "PAYMENT_OVERDUE": {
      const payment = body.payment
      if (!payment?.externalReference) break
      const ref = parseExternalRef(payment.externalReference)
      if (ref?.type === "plan" && ref.orgId) {
        await admin.from("organizations").update({
          subscription_status: "suspended",
        }).eq("id", ref.orgId)
      }
      break
    }

    case "PAYMENT_DELETED":
    case "SUBSCRIPTION_DELETED": {
      const sub = body.subscription ?? (body.payment?.subscription ? { id: body.payment.subscription, customer: "", status: "INACTIVE", externalReference: body.payment.externalReference } : null)
      if (!sub?.externalReference) break
      const ref = parseExternalRef(sub.externalReference)
      if (ref?.type === "plan" && ref.orgId) {
        await admin.from("organizations").update({
          subscription_status:   "expired",
          asaas_subscription_id: null,
        }).eq("id", ref.orgId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
