import { sql } from "@terra/db/client"

export type ApiSite = {
  uuid: string
  id: string
  name: string
  domain: string
  timezone: string
  currency: string
  live: boolean
  createdAt: Date
}

const PUBLIC_ID = /^ws_[A-Za-z0-9]{8,32}$/

const columns = () => sql()`
  id AS uuid, public_id AS id, name, domain, timezone, currency,
  first_event_at IS NOT NULL AS live, created_at AS "createdAt"
`

export function listApiSites(organizationId: string): Promise<ApiSite[]> {
  return sql()<ApiSite[]>`
    SELECT ${columns()} FROM sites
    WHERE organization_id = ${organizationId}
    ORDER BY created_at DESC
  `
}

export async function findApiSite(
  organizationId: string,
  publicId: string
): Promise<ApiSite | null> {
  if (!PUBLIC_ID.test(publicId)) return null
  const [row] = await sql()<ApiSite[]>`
    SELECT ${columns()} FROM sites
    WHERE organization_id = ${organizationId} AND public_id = ${publicId}
  `
  return row ?? null
}

export function publicSite({ uuid: _, ...site }: ApiSite) {
  return site
}
