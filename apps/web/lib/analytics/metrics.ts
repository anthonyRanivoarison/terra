import type { AnalyticsParams } from "./params"
import {
  DIMENSIONS,
  hasFilters,
  QueryBuilder,
  runAll,
  safe,
  type Dimension,
  type Query,
} from "./query"

export type MetricRow = { label: string; value: number; visitors: number }

export const SECTIONS = {
  pages: ["page", "entry", "exit", "title", "hostname"],
  sources: ["referrer", "channel", "utm_source", "utm_medium", "utm_campaign"],
  environment: ["browser", "os", "device", "screen", "language"],
  location: ["country", "region", "city"],
} as const
export type Section = keyof typeof SECTIONS
export type Tab = (typeof SECTIONS)[Section][number]

const OPTIONAL = new Set<Tab>([
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
])

function tabQuery(
  siteId: string,
  params: AnalyticsParams,
  tab: Tab,
  limit: number
): Query {
  const b = new QueryBuilder(siteId)
  if (tab === "page" || tab === "title") {
    const column = tab === "page" ? "s.page" : "s.title"
    return b.build(`
      SELECT COALESCE(${column}, '') AS label,
        COUNT(*)::int AS value, COUNT(*)::int AS visitors
      FROM views s
      WHERE ${b.views(params.current, params.filters)}
        ${tab === "title" ? "AND s.title IS NOT NULL" : ""}
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}
    `)
  }
  const visits = b.visits(params.current, params.filters)
  const column = `v.${DIMENSIONS[tab as Dimension]}`
  return b.build(`
    WITH ${visits}
    SELECT label, COUNT(*)::int AS value, COUNT(*)::int AS visitors
    FROM (
      SELECT COALESCE(${column}, '') AS label, v.visitor_id FROM v
      ${OPTIONAL.has(tab) ? `WHERE NULLIF(${column}, '') IS NOT NULL` : ""}
      GROUP BY 1, 2
    ) t
    GROUP BY 1 ORDER BY 2 DESC LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}
  `)
}

export function getSection(
  siteId: string,
  params: AnalyticsParams,
  section: Section,
  limit = 10
): Promise<Record<string, MetricRow[]>> {
  const tabs = SECTIONS[section]
  return safe(
    `section ${section}`,
    async () => {
      const results = (await runAll(
        tabs.map((tab) => tabQuery(siteId, params, tab, limit))
      )) as MetricRow[][]
      return Object.fromEntries(tabs.map((tab, i) => [tab, results[i] ?? []]))
    },
    Object.fromEntries(tabs.map((tab) => [tab, []]))
  )
}

export type EventStat = MetricRow & {
  props: { key: string; value: string; count: number }[]
}

function eventsQuery(
  siteId: string,
  params: AnalyticsParams,
  select: string,
  from: string,
  tail: string
): Query {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  return b.build(`
    WITH ${visits}
    SELECT ${select}
    FROM ${from}
    WHERE ${b.siteOf("e")} AND NOT e.is_bot AND e.name NOT IN ('purchase', 'refund')
      AND e.created_at >= ${b.p(params.current.from)}::timestamptz
      AND e.created_at < ${b.p(params.current.to)}::timestamptz
      AND ${
        hasFilters(params.filters)
          ? "e.visit_id IN (SELECT id FROM v)"
          : "e.visit_id IS NOT NULL"
      }
      ${b.pageFilter(params.filters, "e")}
    ${tail}
  `)
}

type PropRow = { name: string; key: string; value: string; count: number }

export function getEvents(
  siteId: string,
  params: AnalyticsParams
): Promise<EventStat[]> {
  return safe(
    "events",
    async () => {
      const [rows, pairs] = (await runAll([
        eventsQuery(
          siteId,
          params,
          "e.name AS label, COUNT(*)::int AS value, COUNT(*)::int AS visitors",
          "events e",
          "GROUP BY 1 ORDER BY 2 DESC LIMIT 25"
        ),
        eventsQuery(
          siteId,
          params,
          "e.name, kv.key, kv.value, COUNT(*)::int AS count",
          "events e, jsonb_each_text(CASE WHEN jsonb_typeof(e.props) = 'object' THEN e.props ELSE '{}'::jsonb END) kv",
          "GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 200"
        ),
      ])) as [MetricRow[], PropRow[]]
      return rows.map((row) => ({
        ...row,
        props: pairs
          .filter((p) => p.name === row.label)
          .map(({ key, value, count }) => ({ key, value, count })),
      }))
    },
    []
  )
}
