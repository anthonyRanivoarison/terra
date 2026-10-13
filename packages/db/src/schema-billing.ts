import type { Sql } from "./client"

export async function migrateBilling(sql: Sql): Promise<void> {
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
    await tx`CREATE TABLE IF NOT EXISTS subscriptions (
      organization_id text PRIMARY KEY,
      paddle_customer_id text NOT NULL,
      paddle_subscription_id text NOT NULL UNIQUE,
      plan text NOT NULL,
      status text NOT NULL,
      events_quota integer NOT NULL,
      current_period_end timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`
    await tx`CREATE TABLE IF NOT EXISTS usage_monthly (
      organization_id text NOT NULL,
      month date NOT NULL,
      events integer NOT NULL DEFAULT 0,
      over_quota_since timestamptz,
      PRIMARY KEY (organization_id, month)
    )`
    await tx`ALTER TABLE usage_monthly
      ADD COLUMN IF NOT EXISTS over_quota_since timestamptz`
  })
}
