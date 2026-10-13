import { getEvents, getSection } from "@/lib/analytics/metrics"
import { analyticsRoute } from "@/lib/api/analytics"
import { preflight } from "@/lib/api/cors"
import { invalid } from "@/lib/api/errors"

const BREAKDOWNS = [
  "pages",
  "sources",
  "environment",
  "location",
  "events",
] as const

type Section = Parameters<typeof getSection>[2]

export const GET = analyticsRoute(async ({ site, params, search }) => {
  const section = search.get("section") ?? "pages"
  if (!(BREAKDOWNS as readonly string[]).includes(section)) {
    return invalid(`\`section\` must be one of ${BREAKDOWNS.join(", ")}.`)
  }
  if (section === "events") return getEvents(site.uuid, params)
  return getSection(site.uuid, params, section as Section)
})

export const OPTIONS = preflight
