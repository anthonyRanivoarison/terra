import { sql } from "@terra/db/client"
import type { DemoSite } from "../lib/demo-sites"
import { DEMO_SITES } from "../lib/demo-sites"
import { createSite } from "../lib/sites"

export async function ensureDemoSites(
  organizationId: string
): Promise<string[]> {
  const db = sql()
  const existing = await db<{ public_id: string }[]>`
    SELECT public_id FROM sites WHERE organization_id = ${organizationId}
    ORDER BY created_at, public_id
  `
  const ids: string[] = []
  for (const [i, site] of DEMO_SITES.entries()) {
    const current = existing[i]?.public_id
    if (current) {
      await db`
        UPDATE sites SET name = ${site.name}, domain = ${site.domain}
        WHERE public_id = ${current}
      `
      ids.push(current)
    } else ids.push(await createSite(organizationId, site.name, site.domain))
  }
  return ids
}

export async function seedTraffic(
  publicId: string,
  demo: DemoSite
): Promise<void> {
  const db = sql()
  const [site] = await db`SELECT id FROM sites WHERE public_id = ${publicId}`
  const siteId = site!.id as string

  await db`DELETE FROM visits WHERE site_id = ${siteId}`
  await db`DELETE FROM views WHERE site_id = ${siteId}`
  await db`DELETE FROM events WHERE site_id = ${siteId}`
  await db`DELETE FROM crawls WHERE site_id = ${siteId}`

  await db.unsafe(
    await Bun.file(new URL("./seed-demo.sql", import.meta.url)).text(),
    [
      siteId,
      demo.domain,
      demo.visits,
      demo.crawls,
      demo.name,
      demo.pages,
      [
        demo.domain,
        demo.domain,
        ...demo.subdomains.map((sub) => `${sub}.${demo.domain}`),
      ],
      demo.events,
      demo.priceCents,
      demo.buyRate,
      demo.campaigns,
    ]
  )
  await db`
    UPDATE visits v SET entry_page = f.page, exit_page = l.page
    FROM (
      SELECT DISTINCT ON (visit_id) visit_id, page FROM views
      WHERE site_id = ${siteId} ORDER BY visit_id, entered_at
    ) f, (
      SELECT DISTINCT ON (visit_id) visit_id, page FROM views
      WHERE site_id = ${siteId} ORDER BY visit_id, entered_at DESC
    ) l
    WHERE v.site_id = ${siteId} AND f.visit_id = v.id AND l.visit_id = v.id
  `
  await db`
    UPDATE sites SET first_event_at = COALESCE(first_event_at, now())
    WHERE id = ${siteId}
  `

  const [counts] = await db`
    SELECT (SELECT count(*) FROM visits WHERE site_id = ${siteId})::int AS visits,
      (SELECT count(*) FROM views WHERE site_id = ${siteId})::int AS views,
      (SELECT count(*) FROM events WHERE site_id = ${siteId})::int AS events,
      (SELECT count(*) FROM crawls WHERE site_id = ${siteId})::int AS crawls
  `
  console.log(`Seeded ${demo.name} ${publicId}`, counts)
}
