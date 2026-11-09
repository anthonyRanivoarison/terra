import { sql } from "@terra/db/client"
import { DEMO_SITES, ensureDemoSite, seedTraffic } from "./demo-traffic"

const SLUG = "terra-public-demo"

const db = sql()
await db`
  INSERT INTO organization (id, name, slug, "createdAt")
  VALUES (${crypto.randomUUID()}, 'Public demo', ${SLUG}, now())
  ON CONFLICT (slug) DO NOTHING
`
const [org] = await db`SELECT id FROM organization WHERE slug = ${SLUG}`
const ids: string[] = []
for (const site of DEMO_SITES) {
  const publicId = await ensureDemoSite(org!.id, site)
  await seedTraffic(publicId, site)
  ids.push(publicId)
}
console.log(`Set DEMO_SITE_IDS=${ids.join(",")}`)
await db.end()
process.exit(0)
