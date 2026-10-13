import { getSeries } from "@/lib/analytics/series"
import { analyticsRoute } from "@/lib/api/analytics"
import { preflight } from "@/lib/api/cors"

export const GET = analyticsRoute(({ site, params }) =>
  getSeries(site.uuid, params)
)

export const OPTIONS = preflight
