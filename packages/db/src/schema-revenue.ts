import type { Sql } from "./client"

export async function migrateRevenue(sql: Sql): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`CREATE TABLE IF NOT EXISTS site_paddle (
      site_id uuid PRIMARY KEY REFERENCES sites (id) ON DELETE CASCADE,
      environment text NOT NULL CHECK (environment IN ('sandbox', 'production')),
      api_key_encrypted text NOT NULL,
      notification_id text NOT NULL,
      webhook_secret_encrypted text NOT NULL,
      connected_at timestamptz NOT NULL DEFAULT now(),
      last_backfill_at timestamptz
    )`
    await tx`CREATE TABLE IF NOT EXISTS webhook_events (
      event_id text PRIMARY KEY,
      received_at timestamptz NOT NULL DEFAULT now()
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_webhook_events_received
      ON webhook_events (received_at)`
  })
}
