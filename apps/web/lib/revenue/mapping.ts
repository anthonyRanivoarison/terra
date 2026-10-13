export type RevenueEvent = {
  name: "purchase" | "refund"
  visitorId: string
  visitId: string | null
  amountCents: number
  currency: string
  dedupeKey: string
  occurredAt: Date
  props: Record<string, string>
}

export type PaddleTransactionLike = {
  id: string
  status?: string | null
  customerId?: string | null
  currencyCode?: string | null
  customData?: Record<string, unknown> | null
  details?: { totals?: { total?: string | null } | null } | null
  billedAt?: string | null
  createdAt?: string | null
}

export type PaddleAdjustmentLike = {
  id: string
  action?: string | null
  status?: string | null
  transactionId?: string | null
  customerId?: string | null
  currencyCode?: string | null
  totals?: { total?: string | null } | null
  createdAt?: string | null
}

export type PurchaseRef = { visitorId: string; visitId: string | null }

const VISITOR = /^[A-Za-z0-9_-]{8,64}$/
const VISITOR_KEYS = ["terra_visitor_id", "datafast_visitor_id"]
const MAX_CENTS = 2_147_483_647
const REVERSALS = new Set(["refund", "chargeback"])

export function visitorFromCustomData(
  customData: Record<string, unknown> | null | undefined
): string | null {
  for (const key of VISITOR_KEYS) {
    const value = customData?.[key]
    if (typeof value === "string" && VISITOR.test(value)) return value
  }
  return null
}

export function fallbackVisitor(
  customerId: string | null | undefined,
  id: string
) {
  return `paddle_${(customerId ?? id).replace(/[^A-Za-z0-9_-]/g, "")}`.slice(
    0,
    64
  )
}

function minorUnits(value: string | null | undefined): number | null {
  const amount = Number(value ?? "")
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_CENTS
    ? amount
    : null
}

function date(value: string | null | undefined): Date {
  const parsed = value ? new Date(value) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export function purchaseFromTransaction(
  transaction: PaddleTransactionLike
): RevenueEvent | null {
  if (transaction.status && transaction.status !== "completed") return null
  const amountCents = minorUnits(transaction.details?.totals?.total)
  if (amountCents === null || !transaction.currencyCode) return null
  const props: Record<string, string> = {
    source: "paddle",
    transaction_id: transaction.id,
  }
  if (transaction.customerId) props.customer_id = transaction.customerId
  return {
    name: "purchase",
    visitorId:
      visitorFromCustomData(transaction.customData) ??
      fallbackVisitor(transaction.customerId, transaction.id),
    visitId: null,
    amountCents,
    currency: transaction.currencyCode.toUpperCase(),
    dedupeKey: `purchase:${transaction.id}`,
    occurredAt: date(transaction.billedAt ?? transaction.createdAt),
    props,
  }
}

export function isApprovedReversal(adjustment: PaddleAdjustmentLike): boolean {
  return (
    REVERSALS.has(adjustment.action ?? "") &&
    adjustment.status === "approved" &&
    Boolean(adjustment.transactionId)
  )
}

export function refundFromAdjustment(
  adjustment: PaddleAdjustmentLike,
  purchase: PurchaseRef | null
): RevenueEvent | null {
  if (!isApprovedReversal(adjustment)) return null
  const amount = minorUnits(adjustment.totals?.total)
  if (amount === null || !adjustment.currencyCode) return null
  const props: Record<string, string> = {
    source: "paddle",
    transaction_id: adjustment.transactionId!,
    adjustment_id: adjustment.id,
    action: adjustment.action!,
  }
  if (adjustment.customerId) props.customer_id = adjustment.customerId
  return {
    name: "refund",
    visitorId:
      purchase?.visitorId ??
      fallbackVisitor(adjustment.customerId, adjustment.transactionId!),
    visitId: purchase?.visitId ?? null,
    amountCents: -amount,
    currency: adjustment.currencyCode.toUpperCase(),
    dedupeKey: `refund:${adjustment.id}`,
    occurredAt: date(adjustment.createdAt),
    props,
  }
}
