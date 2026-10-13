import type { Sql } from "./client"

export async function migrateApi(sql: Sql): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`CREATE TABLE IF NOT EXISTS api_keys (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id text NOT NULL,
      name text NOT NULL,
      prefix text NOT NULL,
      key_hash text NOT NULL UNIQUE,
      scopes text[] NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now(),
      last_used_at timestamptz,
      revoked_at timestamptz
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_api_keys_org
      ON api_keys (organization_id, created_at)`
  })
}
