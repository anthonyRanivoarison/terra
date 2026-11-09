import { online, realtime } from "@/lib/analytics/cache"
import { siteRoute } from "@/lib/api/site-route"

export const dynamic = "force-dynamic"

export const GET = siteRoute(async (site, request) => {
  const full = new URL(request.url).searchParams.get("full") === "1"
  const body = full
    ? await realtime(site.id)
    : { online: await online(site.id) }
  return Response.json(body, { headers: { "cache-control": "no-store" } })
})
