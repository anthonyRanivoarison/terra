import type { AnalyticsParams } from "./params"
import { hasFilters, QueryBuilder, runAll, safe, type Query } from "./query"

export const ATTRIBUTION = {
  channel: "channel",
  referrer: "referrer_host",
  campaign: "utm_campaign",
  country: "country",
  entry: "entry_page",
} as const
export type AttributionTab = keyof typeof ATTRIBUTION
export type Model = "first" | "last"

export type RevenueRow = {
  label: string
  revenueCents: number
  purchases: number
}
export type Attribution = Record<Model, Record<AttributionTab, RevenueRow[]>>

const TOUCH: Record<Model, string> = {
  first: "ORDER BY a.started_at ASC",
  last: `AND (a.id = r.visit_id OR (r.visit_id IS NULL AND a.started_at <= r.bought_at))
    ORDER BY (a.id = r.visit_id) DESC, a.started_at DESC`,
}

function attributionQuery(
  siteId: string,
  params: AnalyticsParams,
  model: Model,
  tab: AttributionTab
): Query {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  const scoped = hasFilters(params.filters)
    ? "AND e.visitor_id IN (SELECT visitor_id FROM v)"
    : ""
  return b.build(`
    WITH ${visits},
    r AS (
      SELECT e.visitor_id,
        SUM(e.amount_cents) AS cents,
        COUNT(*) FILTER (WHERE e.name = 'purchase') AS purchases,
        COALESCE(MIN(e.created_at) FILTER (WHERE e.name = 'purchase'), now()) AS bought_at,
        (ARRAY_AGG(e.visit_id) FILTER (
          WHERE e.name = 'purchase' AND e.visit_id IS NOT NULL
        ))[1] AS visit_id
      FROM events e
      WHERE ${b.siteOf("e")} AND e.name IN ('purchase', 'refund')
        AND e.created_at >= ${b.p(params.current.from)}::timestamptz
        AND e.created_at < ${b.p(params.current.to)}::timestamptz
        ${scoped}
      GROUP BY e.visitor_id
    )
    SELECT COALESCE(NULLIF(t.label, ''), '') AS label,
      SUM(r.cents)::float8 AS "revenueCents",
      SUM(r.purchases)::int AS purchases
    FROM r
    LEFT JOIN LATERAL (
      SELECT a.${ATTRIBUTION[tab]} AS label FROM visits a
      WHERE ${b.siteOf("a")} AND a.visitor_id = r.visitor_id ${TOUCH[model]}
      LIMIT 1
    ) t ON true
    GROUP BY 1 ORDER BY 2 DESC LIMIT 10
  `)
}

const TABS = Object.keys(ATTRIBUTION) as AttributionTab[]
const MODELS: Model[] = ["first", "last"]

const emptyAttribution = (): Attribution =>
  Object.fromEntries(
    MODELS.map((m) => [m, Object.fromEntries(TABS.map((t) => [t, []]))])
  ) as unknown as Attribution

export function getAttribution(
  siteId: string,
  params: AnalyticsParams
): Promise<Attribution> {
  return safe(
    "attribution",
    async () => {
      const pairs = MODELS.flatMap((m) => TABS.map((t) => [m, t] as const))
      const results = (await runAll(
        pairs.map(([m, t]) => attributionQuery(siteId, params, m, t))
      )) as RevenueRow[][]
      const out = emptyAttribution()
      pairs.forEach(([m, t], i) => (out[m][t] = results[i] ?? []))
      return out
    },
    emptyAttribution()
  )
}
