import { sql } from "@terra/db/client"
import type { Goal, Payment } from "@/lib/api/validate"

export type WrittenEvent = {
  id: string
  name: string
  visitId: string | null
  createdAt: Date
  amount: number | null
  currency: string | null
  duplicate: boolean
}

type Insert = {
  siteId: string
  name: string
  visitorId: string
  hostname: string | null
  page: string | null
  props: Record<string, string> | null
  amountCents: number | null
  currency: string | null
  dedupeKey: string | null
  at: Date
}

const returning = () => sql()`
  id, name, visit_id AS "visitId", created_at AS "createdAt",
  amount_cents AS amount, currency
`

async function insertEvent(e: Insert): Promise<WrittenEvent> {
  const [row] = await sql()<Omit<WrittenEvent, "duplicate">[]>`
    INSERT INTO events (
      site_id, visit_id, visitor_id, name, hostname, page, props,
      amount_cents, currency, dedupe_key, created_at
    ) VALUES (
      ${e.siteId},
      (SELECT id FROM visits
        WHERE site_id = ${e.siteId} AND visitor_id = ${e.visitorId}
          AND started_at <= ${e.at}::timestamptz + interval '1 minute'
          AND last_seen_at >= ${e.at}::timestamptz - interval '30 minutes'
        ORDER BY started_at DESC LIMIT 1),
      ${e.visitorId}, ${e.name}, ${e.hostname}, ${e.page},
      ${e.props ? JSON.stringify(e.props) : null}::text::jsonb,
      ${e.amountCents}, ${e.currency}, ${e.dedupeKey}, ${e.at}
    )
    ON CONFLICT (site_id, dedupe_key) DO NOTHING
    RETURNING ${returning()}
  `
  if (row) {
    await sql()`
      UPDATE sites SET first_event_at = now()
      WHERE id = ${e.siteId} AND first_event_at IS NULL
    `
    return { ...row, duplicate: false }
  }
  const [existing] = await sql()<Omit<WrittenEvent, "duplicate">[]>`
    SELECT ${returning()} FROM events
    WHERE site_id = ${e.siteId} AND dedupe_key = ${e.dedupeKey}
  `
  return { ...existing!, duplicate: true }
}

export function insertGoal(
  siteId: string,
  goal: Goal,
  fallbackHost: string
): Promise<WrittenEvent> {
  return insertEvent({
    siteId,
    name: goal.name,
    visitorId: goal.visitorId,
    hostname: goal.hostname ?? fallbackHost,
    page: goal.page,
    props: goal.props,
    amountCents: null,
    currency: null,
    dedupeKey: goal.id ? `goal:${goal.id}` : null,
    at: goal.at,
  })
}

export function insertPayment(
  siteId: string,
  payment: Payment
): Promise<WrittenEvent> {
  const kind = payment.refunded ? "refund" : "payment"
  return insertEvent({
    siteId,
    name: payment.refunded ? "refund" : "purchase",
    visitorId: payment.visitorId,
    hostname: null,
    page: null,
    props: { provider: payment.provider, payment_id: payment.id.slice(0, 255) },
    amountCents: payment.refunded ? -payment.amount : payment.amount,
    currency: payment.currency,
    dedupeKey: `${kind}:${payment.provider}:${payment.id}`,
    at: payment.at,
  })
}
