import { createHash } from "node:crypto"
import { sql } from "@terra/db/client"

export const SCOPES = ["read:stats", "write:events", "write:payments"] as const

export type Scope = (typeof SCOPES)[number]

export type ApiKeySummary = {
  id: string
  name: string
  prefix: string
  scopes: Scope[]
  createdAt: Date
  lastUsedAt: Date | null
}

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

export const KEY_PATTERN = /^tk_live_[0-9A-Za-z]{40}$/

function randomBase62(length: number): string {
  const out: string[] = []
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < 248 && out.length < length) out.push(ALPHABET[b % 62]!)
    }
  }
  return out.join("")
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export function isScope(value: string): value is Scope {
  return (SCOPES as readonly string[]).includes(value)
}

export async function createApiKey(
  organizationId: string,
  name: string,
  scopes: Scope[]
): Promise<{ id: string; key: string; prefix: string }> {
  const key = `tk_live_${randomBase62(40)}`
  const prefix = key.slice(0, 12)
  const [row] = await sql()<{ id: string }[]>`
    INSERT INTO api_keys (organization_id, name, prefix, key_hash, scopes)
    VALUES (${organizationId}, ${name}, ${prefix}, ${hashKey(key)}, ${scopes})
    RETURNING id
  `
  return { id: row!.id, key, prefix }
}

export function listApiKeys(organizationId: string): Promise<ApiKeySummary[]> {
  return sql()<ApiKeySummary[]>`
    SELECT id, name, prefix, scopes, created_at AS "createdAt",
      last_used_at AS "lastUsedAt"
    FROM api_keys
    WHERE organization_id = ${organizationId} AND revoked_at IS NULL
    ORDER BY created_at DESC
  `
}

export async function revokeApiKey(
  organizationId: string,
  id: string
): Promise<boolean> {
  const rows = await sql()`
    UPDATE api_keys SET revoked_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}
      AND revoked_at IS NULL
    RETURNING id
  `
  return rows.length > 0
}

export async function findApiKey(
  key: string
): Promise<{ id: string; organizationId: string; scopes: string[] } | null> {
  const [row] = await sql()<
    { id: string; organizationId: string; scopes: string[] }[]
  >`
    SELECT id, organization_id AS "organizationId", scopes FROM api_keys
    WHERE key_hash = ${hashKey(key)} AND revoked_at IS NULL
  `
  return row ?? null
}

export function touchApiKey(id: string): void {
  sql()`
    UPDATE api_keys SET last_used_at = now()
    WHERE id = ${id}
      AND (last_used_at IS NULL OR last_used_at < now() - interval '1 minute')
  `.catch(() => {})
}
