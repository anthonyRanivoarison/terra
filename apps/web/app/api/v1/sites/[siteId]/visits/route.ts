import { getVisits } from "@/lib/analytics/sessions"
import { analyticsRoute } from "@/lib/api/analytics"
import { preflight } from "@/lib/api/cors"
import { invalid } from "@/lib/api/errors"

export const GET = analyticsRoute(async ({ site, params, search }) => {
  const page = Number(search.get("pageNumber") ?? "1")
  if (!Number.isInteger(page) || page < 1 || page > 10_000) {
    return invalid("`pageNumber` must be a positive integer.")
  }
  return getVisits(site.uuid, params, page - 1)
})

export const OPTIONS = preflight
