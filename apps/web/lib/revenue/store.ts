import { sql } from "@terra/db/client"
import type { PurchaseRef, RevenueEvent } from "@/lib/revenue/mapping"

export type PaddleEnvironment = "sandbox" | "production"

export type PaddleConnection = {
  siteId: string
  publicId: string
  environment: PaddleEnvironment
  apiKeyEncrypted: string
  notificationId: string
  webhookSecretEncrypted: string
  connectedAt: Date
  lastBackfillAt: Date | null
}

const columns = () => sql()`
  p.site_id AS "siteId", s.public_id AS "publicId", p.environment,
  p.api_key_encrypted AS "apiKeyEncrypted", p.notification_id AS "notificationId",
  p.webhook_secret_encrypted AS "webhookSecretEncrypted",
  p.connected_at AS "connectedAt", p.last_backfill_at AS "lastBackfillAt"
`

export async function getConnection(siteId: string) {
  const [row] = await sql()<PaddleConnection[]>`
    SELECT ${columns()} FROM site_paddle p JOIN sites s ON s.id = p.site_id
    WHERE p.site_id = ${siteId}
  `
  return row ?? null
}

export async function getConnectionByPublicId(publicId: string) {
  const [row] = await sql()<PaddleConnection[]>`
    SELECT ${columns()} FROM site_paddle p JOIN sites s ON s.id = p.site_id
    WHERE s.public_id = ${publicId}
  `
  return row ?? null
}

export async function sitePublicId(siteId: string): Promise<string | null> {
  const [row] = await sql()<{ publicId: string }[]>`
    SELECT public_id AS "publicId" FROM sites WHERE id = ${siteId}
  `
  return row?.publicId ?? null
}

export async function saveConnection(
  connection: Omit<
    PaddleConnection,
    "publicId" | "connectedAt" | "lastBackfillAt"
  >
) {
  await sql()`
    INSERT INTO site_paddle (
      site_id, environment, api_key_encrypted, notification_id,
      webhook_secret_encrypted
    )
    VALUES (
      ${connection.siteId}, ${connection.environment},
      ${connection.apiKeyEncrypted}, ${connection.notificationId},
      ${connection.webhookSecretEncrypted}
    )
    ON CONFLICT (site_id) DO UPDATE SET
      environment = EXCLUDED.environment,
      api_key_encrypted = EXCLUDED.api_key_encrypted,
      notification_id = EXCLUDED.notification_id,
      webhook_secret_encrypted = EXCLUDED.webhook_secret_encrypted,
      connected_at = now()
  `
}

export async function deleteConnection(siteId: string) {
  await sql()`DELETE FROM site_paddle WHERE site_id = ${siteId}`
}

export async function markBackfilled(siteId: string) {
  await sql()`
    UPDATE site_paddle SET last_backfill_at = now() WHERE site_id = ${siteId}
  `
}

export async function findPurchase(
  siteId: string,
  transactionId: string
): Promise<PurchaseRef | null> {
  const [row] = await sql()<PurchaseRef[]>`
    SELECT visitor_id AS "visitorId", visit_id AS "visitId" FROM events
    WHERE site_id = ${siteId} AND dedupe_key = ${`purchase:${transactionId}`}
  `
  return row ?? null
}

export async function insertRevenueEvent(
  siteId: string,
  event: RevenueEvent
): Promise<boolean> {
  const rows = await sql()`
    INSERT INTO events (
      site_id, visit_id, visitor_id, name, props, amount_cents, currency,
      dedupe_key, created_at
    )
    VALUES (
      ${siteId},
      COALESCE(${event.visitId}::uuid, (
        SELECT id FROM visits
        WHERE site_id = ${siteId} AND visitor_id = ${event.visitorId}
          AND started_at <= ${event.occurredAt}
        ORDER BY started_at DESC LIMIT 1
      )),
      ${event.visitorId}, ${event.name}, ${sql().json(event.props)},
      ${event.amountCents}, ${event.currency}, ${event.dedupeKey},
      ${event.occurredAt}
    )
    ON CONFLICT (site_id, dedupe_key) DO NOTHING
    RETURNING id
  `
  return rows.length > 0
}
