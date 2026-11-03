import type { AnalyticsParams, Granularity, Window } from "./params"
import { hasFilters, QueryBuilder, run } from "./query"

export type ImportedTotals = {
  visitors: number
  visits: number
  views: number
  bounces: number
  duration: number
}

export type ImportedPoint = ImportedTotals & { bucket: string }
export type ImportedValue = { label: string; value: number; visitors: number }

export const IMPORTED_TABS: Record<string, string> = {
  page: "page",
  entry: "entry",
  exit: "exit",
  referrer: "referrer",
  channel: "channel",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  country: "country",
  region: "region",
  device: "device",
  browser: "browser",
  os: "os",
}

export const usesImported = (params: AnalyticsParams) =>
  !hasFilters(params.filters)

function scope(b: QueryBuilder, window: Window, tz: string, dimension: string) {
  const zone = b.p(tz)
  return `${b.siteOf("i")} AND i.dimension = ${b.p(dimension)}
    AND i.date >= (${b.p(window.from)}::timestamptz AT TIME ZONE ${zone})::date
    AND i.date <= ((${b.p(window.to)}::timestamptz - interval '1 second') AT TIME ZONE ${zone})::date
    AND i.date < COALESCE((SELECT (st.first_event_at AT TIME ZONE st.timezone)::date
      FROM sites st WHERE st.id = ${b.site}::uuid), 'infinity'::date)`
}

const SUMS = `COALESCE(SUM(i.visitors), 0)::float8 AS visitors,
  COALESCE(SUM(i.visits), 0)::float8 AS visits,
  COALESCE(SUM(i.pageviews), 0)::float8 AS views,
  COALESCE(SUM(i.bounces), 0)::float8 AS bounces,
  COALESCE(SUM(i.duration), 0)::float8 AS duration`

export async function importedTotals(
  siteId: string,
  window: Window,
  tz: string
): Promise<ImportedTotals> {
  const b = new QueryBuilder(siteId)
  const [row] = await run<ImportedTotals>(
    b.build(
      `SELECT ${SUMS} FROM imported_stats i WHERE ${scope(b, window, tz, "total")}`
    )
  )
  return row ?? { visitors: 0, visits: 0, views: 0, bounces: 0, duration: 0 }
}

export function importedSeries(
  siteId: string,
  window: Window,
  tz: string,
  granularity: Granularity
): Promise<ImportedPoint[]> {
  if (granularity === "hour") return Promise.resolve([])
  const b = new QueryBuilder(siteId)
  const where = scope(b, window, tz, "total")
  return run<ImportedPoint>(
    b.build(`
      SELECT to_char(date_trunc(${b.p(granularity)}, i.date::timestamp),
        'YYYY-MM-DD"T"HH24:MI') AS bucket, ${SUMS}
      FROM imported_stats i WHERE ${where} GROUP BY 1
    `)
  )
}

export function importedValues(
  siteId: string,
  window: Window,
  tz: string,
  tab: string,
  limit: number
): Promise<ImportedValue[]> {
  const dimension = IMPORTED_TABS[tab]
  if (!dimension) return Promise.resolve([])
  const b = new QueryBuilder(siteId)
  const metric = tab === "page" ? "i.pageviews" : "i.visitors"
  return run<ImportedValue>(
    b.build(`
      SELECT i.value AS label, SUM(${metric})::float8 AS value,
        SUM(${metric})::float8 AS visitors
      FROM imported_stats i WHERE ${scope(b, window, tz, dimension)}
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${Math.max(1, Math.min(500, Math.floor(limit)))}
    `)
  )
}
