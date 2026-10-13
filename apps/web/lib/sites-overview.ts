import { sql } from "@terra/db/client"

export type SiteOverview = {
  visitors: number
  previousVisitors: number
  revenueCents: number
  online: number
  topSource: string | null
  daily: number[]
}

const DAYS = 30

const empty = (): SiteOverview => ({
  visitors: 0,
  previousVisitors: 0,
  revenueCents: 0,
  online: 0,
  topSource: null,
  daily: Array.from({ length: DAYS }, () => 0),
})

export async function getSitesOverview(
  siteIds: string[]
): Promise<Record<string, SiteOverview>> {
  const out: Record<string, SiteOverview> = Object.fromEntries(
    siteIds.map((id) => [id, empty()])
  )
  if (!siteIds.length) return out
  const db = sql()
  const ids = siteIds

  const [daily, totals, revenue, online, sources] = await Promise.all([
    db<{ siteId: string; day: number; visitors: number }[]>`
      SELECT site_id AS "siteId",
        (${DAYS - 1} - (current_date - d::date))::int AS day,
        count(*)::int AS visitors
      FROM (
        SELECT site_id, date_trunc('day', started_at) AS d, visitor_id
        FROM visits
        WHERE site_id = ANY(${ids}::uuid[]) AND NOT is_bot
          AND started_at >= current_date - ${DAYS - 1}::int
        GROUP BY 1, 2, 3
      ) t
      GROUP BY 1, 2
    `,
    db<{ siteId: string; current: number; previous: number }[]>`
      SELECT site_id AS "siteId",
        count(*) FILTER (WHERE recent)::int AS current,
        count(*) FILTER (WHERE NOT recent)::int AS previous
      FROM (
        SELECT site_id, visitor_id, started_at >= now() - interval '7 days' AS recent
        FROM visits
        WHERE site_id = ANY(${ids}::uuid[]) AND NOT is_bot
          AND started_at >= now() - interval '14 days'
        GROUP BY 1, 2, 3
      ) t
      GROUP BY 1
    `,
    db<{ siteId: string; cents: number }[]>`
      SELECT site_id AS "siteId", coalesce(sum(amount_cents), 0)::float8 AS cents
      FROM events
      WHERE site_id = ANY(${ids}::uuid[])
        AND name IN ('purchase', 'refund')
        AND created_at >= now() - interval '7 days'
      GROUP BY 1
    `,
    db<{ siteId: string; online: number }[]>`
      SELECT site_id AS "siteId", count(DISTINCT visitor_id)::int AS online
      FROM visits
      WHERE site_id = ANY(${ids}::uuid[]) AND NOT is_bot
        AND last_seen_at > now() - interval '2 minutes'
      GROUP BY 1
    `,
    db<{ siteId: string; source: string }[]>`
      SELECT DISTINCT ON (site_id) site_id AS "siteId",
        coalesce(referrer_host, channel) AS source
      FROM visits
      WHERE site_id = ANY(${ids}::uuid[]) AND NOT is_bot
        AND started_at >= now() - interval '7 days'
      GROUP BY site_id, coalesce(referrer_host, channel)
      ORDER BY site_id, count(*) DESC
    `,
  ])

  for (const row of daily) {
    const site = out[row.siteId]
    if (site && row.day >= 0 && row.day < DAYS)
      site.daily[row.day] = row.visitors
  }
  for (const row of totals) {
    const site = out[row.siteId]
    if (site) {
      site.visitors = row.current
      site.previousVisitors = row.previous
    }
  }
  for (const row of revenue) {
    const site = out[row.siteId]
    if (site) site.revenueCents = Number(row.cents)
  }
  for (const row of online) {
    const site = out[row.siteId]
    if (site) site.online = row.online
  }
  for (const row of sources) {
    const site = out[row.siteId]
    if (site) site.topSource = row.source
  }
  return out
}
