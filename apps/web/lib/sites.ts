import { sql } from "@terra/db/client"
import { isDemoSite } from "@/lib/demo"

export type SiteSummary = {
  id: string
  publicId: string
  name: string
  domain: string
  botToken: string
  firstEventAt: Date | null
  createdAt: Date
}

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

function randomId(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")
}

export function normalizeDomain(input: string): string | null {
  const raw = input.trim().toLowerCase()
  const host = raw
    .replace(/^[a-z]+:\/\//, "")
    .split(/[/?#]/)[0]!
    .replace(/:\d+$/, "")
    .replace(/^www\./, "")
  const valid =
    /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
  return valid.test(host) ? host : null
}

const columns = () => sql()`
  id, public_id AS "publicId", name, domain, bot_token AS "botToken",
  first_event_at AS "firstEventAt", created_at AS "createdAt"
`

export async function createSite(
  organizationId: string,
  name: string,
  domain: string,
  timezone = "UTC"
): Promise<string> {
  const [row] = await sql()<{ publicId: string }[]>`
    INSERT INTO sites (public_id, organization_id, name, domain, timezone, salt, bot_token)
    VALUES (
      ${`ws_${randomId(16)}`}, ${organizationId}, ${name}, ${domain},
      ${timezone}, ${randomId(32)}, ${`bt_${randomId(32)}`}
    )
    RETURNING public_id AS "publicId"
  `
  return row!.publicId
}

export function listSites(organizationId: string): Promise<SiteSummary[]> {
  return sql()<SiteSummary[]>`
    SELECT ${columns()} FROM sites
    WHERE organization_id = ${organizationId}
    ORDER BY created_at DESC
  `
}

export async function getSite(
  organizationId: string,
  publicId: string
): Promise<SiteSummary | null> {
  const [row] = await sql()<SiteSummary[]>`
    SELECT ${columns()} FROM sites
    WHERE organization_id = ${organizationId} AND public_id = ${publicId}
  `
  return row ?? null
}

export async function getDemoSite(
  publicId: string
): Promise<SiteSummary | null> {
  if (!isDemoSite(publicId)) return null
  const [row] = await sql()<SiteSummary[]>`
    SELECT ${columns()} FROM sites WHERE public_id = ${publicId}
  `
  return row ?? null
}
