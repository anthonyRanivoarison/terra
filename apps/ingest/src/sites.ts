import { sql } from "@terra/db/client"

export type Site = {
  id: string
  domain: string
  allowed: string[]
  botToken: string
  live: boolean
}

const TTL_MS = 60_000
const cache = new Map<string, { site: Site | null; at: number }>()

export async function findSite(publicId: string): Promise<Site | null> {
  const hit = cache.get(publicId)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.site
  const rows = await sql()<
    {
      id: string
      domain: string
      allowed_hostnames: string[]
      bot_token: string
      first_event_at: Date | null
    }[]
  >`
    SELECT id, domain, allowed_hostnames, bot_token, first_event_at
    FROM sites WHERE public_id = ${publicId}
  `
  const row = rows[0]
  const site = row
    ? {
        id: row.id,
        domain: row.domain,
        allowed: row.allowed_hostnames,
        botToken: row.bot_token,
        live: row.first_event_at !== null,
      }
    : null
  cache.set(publicId, { site, at: Date.now() })
  return site
}

export function markLive(publicId: string): void {
  const hit = cache.get(publicId)
  if (hit?.site) hit.site.live = true
}
