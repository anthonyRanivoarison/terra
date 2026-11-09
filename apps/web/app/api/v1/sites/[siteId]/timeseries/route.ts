import { seriesWithImported } from "@/lib/analytics/with-imported"
import { analyticsRoute } from "@/lib/api/analytics"
import { preflight } from "@/lib/api/cors"

export const GET = analyticsRoute(({ site, params }) =>
  seriesWithImported(site.uuid, params)
)

export const OPTIONS = preflight
