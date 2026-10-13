import { BOUNCED } from "./overview"
import type { AnalyticsParams } from "./params"
import { QueryBuilder, run, safe } from "./query"

export type Funnel = {
  visitors: number
  engaged: number
  goals: number
  purchases: number
  revenueCents: number
}

export const PASSIVE_EVENTS =
  "('click', 'outbound_click', 'purchase', 'refund')"

const EMPTY_FUNNEL: Funnel = {
  visitors: 0,
  engaged: 0,
  goals: 0,
  purchases: 0,
  revenueCents: 0,
}

export function getFunnel(
  siteId: string,
  params: AnalyticsParams
): Promise<Funnel> {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  const query = b.build(`
    WITH ${visits},
    people AS (
      SELECT v.visitor_id, bool_or(NOT ${BOUNCED}) AS engaged
      FROM v GROUP BY 1
    ),
    ev AS (
      SELECT e.visitor_id,
        bool_or(e.name NOT IN ${PASSIVE_EVENTS}) AS goal,
        bool_or(e.name = 'purchase') AS bought,
        COALESCE(SUM(e.amount_cents) FILTER (
          WHERE e.name IN ('purchase', 'refund')), 0) AS cents
      FROM events e JOIN people USING (visitor_id)
      WHERE ${b.siteOf("e")} AND NOT e.is_bot
        AND e.created_at >= ${b.p(params.current.from)}::timestamptz
        AND e.created_at < ${b.p(params.current.to)}::timestamptz
      GROUP BY 1
    )
    SELECT COUNT(*)::int AS visitors,
      COUNT(*) FILTER (WHERE p.engaged)::int AS engaged,
      COUNT(*) FILTER (WHERE p.engaged AND ev.goal)::int AS goals,
      COUNT(*) FILTER (WHERE ev.bought)::int AS purchases,
      COALESCE(SUM(ev.cents), 0)::float8 AS "revenueCents"
    FROM people p LEFT JOIN ev USING (visitor_id)
  `)
  return safe(
    "funnel",
    async () => (await run<Funnel>(query))[0] ?? EMPTY_FUNNEL,
    EMPTY_FUNNEL
  )
}
