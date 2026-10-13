import { sql } from "@terra/db/client"
import { isUuid, safe } from "./query"
import { realtimeQueries } from "./realtime-queries"

export type FeedItem = {
  kind: "view" | "event"
  at: string
  label: string
  visitId: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
}

export type Realtime = {
  online: number
  visitors30m: number
  views30m: number
  minutes: { minute: string; views: number }[]
  pages: { label: string; visitors: number }[]
  countries: { label: string; visitors: number }[]
  referrers: { label: string; visitors: number }[]
  feed: FeedItem[]
  points: { latitude: number; longitude: number; visitors: number }[]
}

export const EMPTY_REALTIME: Realtime = {
  online: 0,
  visitors30m: 0,
  views30m: 0,
  minutes: [],
  pages: [],
  countries: [],
  referrers: [],
  feed: [],
  points: [],
}

type Rows = [
  { online: number; visitors: number; views: number }[],
  Realtime["minutes"],
  Realtime["pages"],
  Realtime["countries"],
  Realtime["referrers"],
  FeedItem[],
  Realtime["points"],
]

export function getOnline(siteId: string): Promise<number> {
  if (!isUuid(siteId)) return Promise.resolve(0)
  return safe(
    "online",
    async () => {
      const [row] = await sql()<{ online: number }[]>`
        SELECT COUNT(*)::int AS online FROM (
          SELECT visitor_id FROM visits
          WHERE site_id = ${siteId} AND NOT is_bot
            AND last_seen_at > now() - interval '2 minutes'
          GROUP BY 1
        ) t
      `
      return row?.online ?? 0
    },
    0
  )
}

export function getRealtime(siteId: string): Promise<Realtime> {
  if (!isUuid(siteId)) return Promise.resolve(EMPTY_REALTIME)
  return safe(
    "realtime",
    async () => {
      const [summary, minutes, pages, countries, referrers, feed, points] =
        (await Promise.all(realtimeQueries(siteId))) as unknown as Rows
      const s = summary[0] ?? { online: 0, visitors: 0, views: 0 }
      return {
        online: s.online,
        visitors30m: s.visitors,
        views30m: s.views,
        minutes,
        pages,
        countries,
        referrers,
        feed: feed.map((f) => ({
          ...f,
          at: new Date(f.at).toISOString(),
        })),
        points,
      }
    },
    EMPTY_REALTIME
  )
}
