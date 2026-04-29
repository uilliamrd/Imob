import { createAdminClient } from "@/lib/supabase/admin"

const BASE_URL = process.env.ASAAS_SANDBOX === "true"
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3"

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "access_token": process.env.ASAAS_API_KEY!,
      "Content-Type": "application/json",
      "User-Agent": "RealStateIntelligence/1.0",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = (json as { errors?: { description: string }[] }).errors?.[0]?.description ?? "Erro na API Asaas"
    throw new Error(msg)
  }
  return json as T
}

interface AsaasCustomer {
  id: string
  name: string
  email: string
}

interface AsaasPayment {
  id: string
  value: number
  status: string
  invoiceUrl: string
  bankSlipUrl?: string
  subscription?: string
  externalReference?: string
}

interface AsaasSubscription {
  id: string
  status: string
  value: number
  nextDueDate: string
}

export async function getOrCreateAsaasCustomer(
  orgId: string,
  name: string,
  email: string,
): Promise<string> {
  const admin = createAdminClient()
  const { data: org } = await admin
    .from("organizations")
    .select("asaas_customer_id")
    .eq("id", orgId)
    .single()

  if (org?.asaas_customer_id) return org.asaas_customer_id

  // Busca cliente existente por e-mail para evitar duplicatas
  const search = await request<{ data: AsaasCustomer[] }>(`/customers?email=${encodeURIComponent(email)}&limit=1`, "GET")
  let customerId: string

  if (search.data.length > 0) {
    customerId = search.data[0].id
  } else {
    const created = await request<AsaasCustomer>("/customers", "POST", {
      name,
      email,
      externalReference: orgId,
    })
    customerId = created.id
  }

  await admin.from("organizations").update({ asaas_customer_id: customerId }).eq("id", orgId)
  return customerId
}

export async function createSubscription(
  customerId: string,
  value: number,
  description: string,
  externalReference: string,
): Promise<{ subscriptionId: string; invoiceUrl: string }> {
  const nextDueDate = new Date()
  nextDueDate.setDate(nextDueDate.getDate() + 1)
  const dueDateStr = nextDueDate.toISOString().split("T")[0]

  const sub = await request<AsaasSubscription>("/subscriptions", "POST", {
    customer:          customerId,
    billingType:       "UNDEFINED",
    value,
    nextDueDate:       dueDateStr,
    cycle:             "MONTHLY",
    description,
    externalReference,
  })

  // Busca o primeiro pagamento da assinatura para obter o link
  const payments = await request<{ data: AsaasPayment[] }>(
    `/subscriptions/${sub.id}/payments?limit=1`, "GET"
  )
  const invoiceUrl = payments.data[0]?.invoiceUrl ?? `https://www.asaas.com/s/${sub.id}`

  return { subscriptionId: sub.id, invoiceUrl }
}

export async function createPayment(
  customerId: string,
  value: number,
  description: string,
  externalReference: string,
): Promise<{ paymentId: string; invoiceUrl: string }> {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)
  const dueDateStr = dueDate.toISOString().split("T")[0]

  const payment = await request<AsaasPayment>("/payments", "POST", {
    customer:          customerId,
    billingType:       "UNDEFINED",
    value,
    dueDate:           dueDateStr,
    description,
    externalReference,
  })

  return { paymentId: payment.id, invoiceUrl: payment.invoiceUrl }
}
