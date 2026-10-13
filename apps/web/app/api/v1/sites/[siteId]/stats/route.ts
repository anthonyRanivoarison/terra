import { getOverview } from "@/lib/analytics/overview"
import { analyticsRoute } from "@/lib/api/analytics"
import { preflight } from "@/lib/api/cors"

export const GET = analyticsRoute(({ site, params }) =>
  getOverview(site.uuid, params)
)

export const OPTIONS = preflight
