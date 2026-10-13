import { sql, type Tx } from "@terra/db/client"
import type { Job } from "./jobs"

const PASSIVE = /_viewed$/

async function pageview(tx: Tx, job: Extract<Job, { kind: "pageview" }>) {
  const { p, info, source: s, siteId, at } = job
  const { geo, details: d } = info
  await tx`
    INSERT INTO visits (
      id, site_id, visitor_id, started_at, last_seen_at, entry_page, exit_page,
      hostname, views, is_bot,
      is_new, referrer, referrer_host, channel, utm_source, utm_medium,
      utm_campaign, utm_term, utm_content, ref, country, region, city,
      latitude, longitude, device, browser, browser_version, os, os_version,
      language, screen, as_org
    ) VALUES (
      ${p.sessionId}, ${siteId}, ${p.visitorId}, ${at}, ${at}, ${p.location.page},
      ${p.location.page}, ${p.location.hostname}, 1, ${info.isBot},
      NOT EXISTS (
        SELECT 1 FROM visits WHERE site_id = ${siteId} AND visitor_id = ${p.visitorId}
      ),
      ${s.referrer}, ${s.host}, ${s.channel}, ${s.utm.source}, ${s.utm.medium},
      ${s.utm.campaign}, ${s.utm.term}, ${s.utm.content}, ${s.utm.ref},
      ${geo.country}, ${geo.region}, ${geo.city}, ${geo.latitude},
      ${geo.longitude}, ${info.device}, ${info.browser}, ${d.browserVersion},
      ${info.os}, ${d.osVersion}, ${d.language}, ${d.screen}, ${geo.asOrg}
    )
    ON CONFLICT (id) DO UPDATE SET
      views = visits.views + 1,
      exit_page = EXCLUDED.exit_page,
      last_seen_at = GREATEST(visits.last_seen_at, EXCLUDED.last_seen_at),
      language = COALESCE(visits.language, EXCLUDED.language),
      screen = COALESCE(visits.screen, EXCLUDED.screen)
    WHERE visits.site_id = EXCLUDED.site_id
      AND visits.visitor_id = EXCLUDED.visitor_id
  `
  await tx`
    INSERT INTO views (
      id, site_id, visit_id, visitor_id, hostname, page, query, title, is_bot,
      entered_at, last_seen_at
    )
    SELECT ${p.viewId}, ${siteId}, ${p.sessionId}, ${p.visitorId},
      ${p.location.hostname}, ${p.location.page}, ${p.location.query},
      ${p.title}, ${info.isBot}, ${at}, ${at}
    WHERE EXISTS (
      SELECT 1 FROM visits
      WHERE id = ${p.sessionId} AND site_id = ${siteId}
        AND visitor_id = ${p.visitorId}
    )
    ON CONFLICT (id) DO NOTHING
  `
}

async function ping(tx: Tx, job: Extract<Job, { kind: "ping" }>) {
  const { p, siteId, at } = job
  const v = p.vitals
  await tx`
    WITH view AS (
      UPDATE views SET
        last_seen_at = GREATEST(last_seen_at, ${at}),
        left_at = CASE WHEN ${p.type === "leave"} THEN ${at}::timestamptz ELSE left_at END,
        duration_s = GREATEST(duration_s, ${p.duration}),
        scroll_pct = GREATEST(COALESCE(scroll_pct, 0), ${p.scroll ?? 0}),
        lcp_ms = COALESCE(${v?.lcp ?? null}::int, lcp_ms),
        inp_ms = COALESCE(${v?.inp ?? null}::int, inp_ms),
        cls = COALESCE(${v?.cls ?? null}::real, cls),
        fcp_ms = COALESCE(${v?.fcp ?? null}::int, fcp_ms),
        ttfb_ms = COALESCE(${v?.ttfb ?? null}::int, ttfb_ms)
      WHERE id = ${p.viewId} AND site_id = ${siteId} AND visit_id = ${p.sessionId}
      RETURNING visit_id
    )
    UPDATE visits SET last_seen_at = GREATEST(visits.last_seen_at, ${at})
    FROM view WHERE visits.id = view.visit_id
  `
}

async function event(tx: Tx, job: Extract<Job, { kind: "event" }>) {
  const { p, siteId, isBot, at } = job
  await tx`
    WITH inserted AS (
      INSERT INTO events (
        site_id, visit_id, visitor_id, name, hostname, page, props, is_bot,
        created_at
      ) VALUES (
        ${siteId},
        (SELECT id FROM visits WHERE id = ${p.sessionId}::uuid
          AND site_id = ${siteId} AND visitor_id = ${p.visitorId}),
        ${p.visitorId}, ${p.name}, ${p.location.hostname}, ${p.location.page},
        ${p.props ? JSON.stringify(p.props) : null}::text::jsonb, ${isBot},
        ${at}
      )
      RETURNING visit_id
    )
    UPDATE visits SET
      interactions = interactions + 1,
      last_seen_at = GREATEST(last_seen_at, ${at})
    FROM inserted
    WHERE ${!PASSIVE.test(p.name)} AND visits.id = inserted.visit_id
  `
}

async function crawl(tx: Tx, job: Extract<Job, { kind: "crawl" }>) {
  const c = job.crawl
  await tx`
    INSERT INTO crawls (
      site_id, at, crawler, company, category, hostname, path, status,
      ip_verified
    )
    VALUES (${job.siteId}, ${job.at}, ${c.crawler}, ${c.company},
      ${c.category}, ${c.hostname}, ${c.path}, ${c.status}, ${c.ipVerified})
  `
}

function write(tx: Tx, job: Job): Promise<unknown> {
  if (job.kind === "pageview") return pageview(tx, job)
  if (job.kind === "ping") return ping(tx, job)
  if (job.kind === "event") return event(tx, job)
  return crawl(tx, job)
}

export async function writeJobs(jobs: Job[]): Promise<void> {
  const live = new Set<string>()
  await sql().begin(async (tx) => {
    for (const job of jobs) {
      const ok = await tx
        .savepoint((sp) => write(sp, job))
        .then(() => true)
        .catch((error) => {
          console.error(`[ingest] dropped ${job.kind} for ${job.siteId}`, error)
          return false
        })
      if (ok && job.kind !== "crawl") live.add(job.siteId)
    }
    if (live.size) {
      await tx`
        UPDATE sites SET first_event_at = now()
        WHERE id = ANY(${[...live]}::uuid[]) AND first_event_at IS NULL
      `
    }
  })
}
