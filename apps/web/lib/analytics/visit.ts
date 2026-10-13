import { isUuid, QueryBuilder, run, safe } from "./query"
import { VISIT_FIELDS, type TimelineItem, type VisitRow } from "./sessions"

export type VisitDetail = {
  visit: VisitRow
  visitor: { visits: number; firstSeen: string; revenueCents: number }
  timeline: TimelineItem[]
  others: VisitRow[]
}

function visitQuery(siteId: string, visitId: string) {
  const b = new QueryBuilder(siteId)
  return b.build(
    `SELECT ${VISIT_FIELDS} FROM visits v
    WHERE ${b.siteOf("v")} AND v.id = ${b.p(visitId)}::uuid`
  )
}

function detailQueries(siteId: string, visitId: string, visitorId: string) {
  const stats = new QueryBuilder(siteId)
  const visitor = stats.p(visitorId)
  const timeline = new QueryBuilder(siteId)
  const id = timeline.p(visitId)
  const others = new QueryBuilder(siteId)
  return [
    stats.build(`
      SELECT COUNT(*)::int AS visits,
        to_json(MIN(started_at)) #>> '{}' AS "firstSeen",
        COALESCE((SELECT SUM(e.amount_cents) FROM events e
          WHERE ${stats.siteOf("e")} AND e.visitor_id = ${visitor}
            AND e.name IN ('purchase', 'refund')), 0)::float8 AS "revenueCents"
      FROM visits v WHERE ${stats.siteOf("v")} AND v.visitor_id = ${visitor}
    `),
    timeline.build(`
      SELECT * FROM (
        SELECT 'view' AS kind, s.entered_at AS at, s.page AS label,
          s.title AS detail, s.duration_s AS "durationS",
          s.scroll_pct::int AS "scrollPct", NULL::int AS "amountCents"
        FROM views s
        WHERE ${timeline.siteOf("s")} AND s.visit_id = ${id}::uuid
        UNION ALL
        SELECT 'event', e.created_at, e.name, e.props::text, NULL, NULL,
          e.amount_cents
        FROM events e
        WHERE ${timeline.siteOf("e")} AND e.visit_id = ${id}::uuid
      ) t ORDER BY at
    `),
    others.build(`
      SELECT ${VISIT_FIELDS} FROM visits v
      WHERE ${others.siteOf("v")} AND v.visitor_id = ${others.p(visitorId)}
        AND v.id <> ${others.p(visitId)}::uuid
      ORDER BY v.started_at DESC LIMIT 10
    `),
  ]
}

export function getVisit(
  siteId: string,
  visitId: string
): Promise<VisitDetail | null> {
  if (!isUuid(siteId) || !isUuid(visitId)) return Promise.resolve(null)
  return safe(
    "visit",
    async () => {
      const [visit] = await run<VisitRow>(visitQuery(siteId, visitId))
      if (!visit) return null
      const [stats, timeline, others] = await Promise.all(
        detailQueries(siteId, visitId, visit.visitorId).map((q) =>
          run<unknown>(q)
        )
      )
      return {
        visit,
        visitor: stats![0] as VisitDetail["visitor"],
        timeline: (timeline as TimelineItem[]).map((t) => ({
          ...t,
          at: new Date(t.at).toISOString(),
        })),
        others: others as VisitRow[],
      }
    },
    null
  )
}
