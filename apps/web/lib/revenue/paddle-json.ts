import type {
  PaddleAdjustmentLike,
  PaddleTransactionLike,
} from "@/lib/revenue/mapping"

export type PaddleNotification = {
  eventId: string
  eventType: string
  data: Record<string, unknown>
}

type Json = Record<string, unknown>

const obj = (value: unknown): Json | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : null

export const str = (value: unknown): string | null =>
  typeof value === "string" ? value : null

export function parseNotification(body: string): PaddleNotification | null {
  try {
    const json = obj(JSON.parse(body))
    const eventId = str(json?.event_id)
    const eventType = str(json?.event_type)
    const data = obj(json?.data)
    return eventId && eventType && data ? { eventId, eventType, data } : null
  } catch {
    return null
  }
}

const total = (value: unknown) => ({ total: str(obj(value)?.total) })

export function transactionFromJson(data: Json): PaddleTransactionLike | null {
  const id = str(data.id)
  if (!id) return null
  return {
    id,
    status: str(data.status),
    customerId: str(data.customer_id),
    currencyCode: str(data.currency_code),
    customData: obj(data.custom_data),
    details: { totals: total(obj(data.details)?.totals) },
    billedAt: str(data.billed_at),
    createdAt: str(data.created_at),
  }
}

export function adjustmentFromJson(data: Json): PaddleAdjustmentLike | null {
  const id = str(data.id)
  if (!id) return null
  return {
    id,
    action: str(data.action),
    status: str(data.status),
    transactionId: str(data.transaction_id),
    customerId: str(data.customer_id),
    currencyCode: str(data.currency_code),
    totals: total(data.totals),
    createdAt: str(data.created_at),
  }
}
