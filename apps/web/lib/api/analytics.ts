import { parseParams } from "@/lib/analytics/params"
import { apiError } from "@/lib/api/errors"
import { searchRecord, siteRoute } from "@/lib/api/handler"
import type { ApiSite } from "@/lib/api/site"

type Params = ReturnType<typeof parseParams>

type AnalyticsContext = {
  site: ApiSite
  params: Params
  search: URLSearchParams
}

export function analyticsRoute(
  handler: (ctx: AnalyticsContext) => Promise<unknown>
) {
  return siteRoute<{ siteId: string }>(
    "read:stats",
    async ({ site, search }) => {
      let params: Params
      try {
        params = parseParams(searchRecord(search), Date.now(), site.timezone)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid query parameters."
        return apiError(400, "invalid_query", message)
      }
      const data = await handler({ site, params, search })
      if (data instanceof Response) return data
      return Response.json({ data })
    }
  )
}
