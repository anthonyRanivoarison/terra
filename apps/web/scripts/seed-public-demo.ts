import { sql } from "@terra/db/client"
import { ensureDemoSite, seedTraffic } from "./demo-traffic"

const SLUG = "terra-public-demo"

const db = sql()
await db`
  INSERT INTO organization (id, name, slug, "createdAt")
  VALUES (${crypto.randomUUID()}, 'Public demo', ${SLUG}, now())
  ON CONFLICT (slug) DO NOTHING
`
const [org] = await db`SELECT id FROM organization WHERE slug = ${SLUG}`
const publicId = await ensureDemoSite(org!.id)
await seedTraffic(publicId)
console.log(`Set DEMO_SITE_ID=${publicId}`)
await db.end()
process.exit(0)
