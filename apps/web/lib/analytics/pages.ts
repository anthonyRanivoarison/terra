import type { AnalyticsParams } from "./params"
import { QueryBuilder, run, safe } from "./query"

export type PageStat = {
  page: string
  views: number
  visitors: number
  duration: number
  scroll: number | null
  entries: number
  exits: number
}

export function getPages(
  siteId: string,
  params: AnalyticsParams,
  limit = 200
): Promise<PageStat[]> {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  const views = b.views(params.current, params.filters)
  const query = b.build(`
    WITH ${visits},
    pv AS (
      SELECT s.page, COUNT(*) AS views,
        COUNT(DISTINCT s.visitor_id) AS visitors,
        AVG(s.duration_s) AS duration, AVG(s.scroll_pct) AS scroll
      FROM views s WHERE ${views} GROUP BY 1
    ),
    en AS (SELECT v.entry_page AS page, COUNT(*) AS entries FROM v GROUP BY 1),
    ex AS (SELECT v.exit_page AS page, COUNT(*) AS exits FROM v GROUP BY 1)
    SELECT pv.page, pv.views::int AS views, pv.visitors::int AS visitors,
      COALESCE(pv.duration, 0)::float8 AS duration,
      pv.scroll::float8 AS scroll,
      COALESCE(en.entries, 0)::int AS entries,
      COALESCE(ex.exits, 0)::int AS exits
    FROM pv LEFT JOIN en USING (page) LEFT JOIN ex USING (page)
    ORDER BY pv.views DESC
    LIMIT ${Math.max(1, Math.min(500, Math.floor(limit)))}
  `)
  return safe("pages", () => run<PageStat>(query), [])
}
