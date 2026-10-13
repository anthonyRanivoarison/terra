import { getRealtime } from "@/lib/analytics/realtime"
import { preflight } from "@/lib/api/cors"
import { siteRoute } from "@/lib/api/handler"

export const GET = siteRoute("read:stats", async ({ site }) =>
  Response.json({ data: await getRealtime(site.uuid) })
)

export const OPTIONS = preflight
