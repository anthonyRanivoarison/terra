import { sql } from "@terra/db/client"

export function realtimeQueries(siteId: string) {
  const q = sql()
  const recent = q`now() - interval '30 minutes'`
  const live = q`now() - interval '2 minutes'`
  return [
    q`
      SELECT
        (SELECT COUNT(*) FROM (SELECT visitor_id FROM visits
          WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${live}
          GROUP BY 1) t)::int AS online,
        (SELECT COUNT(*) FROM (SELECT visitor_id FROM visits
          WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${recent}
          GROUP BY 1) t)::int AS visitors,
        (SELECT COUNT(*) FROM views
          WHERE site_id = ${siteId} AND NOT is_bot
            AND entered_at > ${recent})::int AS views
    `,
    q`
      SELECT to_char(m, 'YYYY-MM-DD"T"HH24:MI"Z"') AS minute,
        COUNT(s.id)::int AS views
      FROM generate_series(
        date_trunc('minute', now() - interval '29 minutes'),
        date_trunc('minute', now()), interval '1 minute'
      ) m
      LEFT JOIN views s
        ON s.site_id = ${siteId} AND NOT s.is_bot
        AND s.entered_at > ${recent}
        AND date_trunc('minute', s.entered_at) = m
      GROUP BY m ORDER BY m
    `,
    q`
      SELECT page AS label, COUNT(DISTINCT visitor_id)::int AS visitors
      FROM views
      WHERE site_id = ${siteId} AND NOT is_bot
        AND entered_at > now() - interval '6 hours'
        AND last_seen_at > now() - interval '45 seconds'
        AND (left_at IS NULL OR last_seen_at > left_at)
        AND visit_id IN (
          SELECT id FROM visits
          WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${live}
        )
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8
    `,
    q`
      SELECT COALESCE(country, '') AS label,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM visits
      WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${recent}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8
    `,
    q`
      SELECT COALESCE(referrer_host, channel) AS label,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM visits
      WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${recent}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8
    `,
    q`
      SELECT * FROM (
        SELECT 'view' AS kind, s.entered_at AS at, s.page AS label,
          s.visit_id AS "visitId", v.country, v.city, v.device, v.browser
        FROM views s JOIN visits v ON v.id = s.visit_id AND v.site_id = s.site_id
        WHERE s.site_id = ${siteId} AND NOT s.is_bot AND s.entered_at > ${recent}
        UNION ALL
        SELECT 'event', e.created_at, e.name, e.visit_id, v.country, v.city,
          v.device, v.browser
        FROM events e
        LEFT JOIN visits v ON v.id = e.visit_id AND v.site_id = e.site_id
        WHERE e.site_id = ${siteId} AND NOT e.is_bot AND e.created_at > ${recent}
      ) feed ORDER BY at DESC LIMIT 40
    `,
    q`
      SELECT ROUND(latitude::numeric, 1)::float8 AS latitude,
        ROUND(longitude::numeric, 1)::float8 AS longitude,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM visits
      WHERE site_id = ${siteId} AND NOT is_bot AND last_seen_at > ${recent}
        AND latitude IS NOT NULL
      GROUP BY 1, 2
    `,
  ]
}
