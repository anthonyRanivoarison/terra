import { siteRoute } from "@/lib/api/site-route"
import { getEvents, getTab, isTab } from "@/lib/analytics/metrics"
import { FILTER_KEYS, parseParams } from "@/lib/analytics/params"
import { getSiteSettings } from "@/lib/analytics/settings"

export const dynamic = "force-dynamic"

const isFilterKey = (value: string | null) =>
  !!value && (FILTER_KEYS as readonly string[]).includes(value)

export const GET = siteRoute(async (site, request) => {
  const url = new URL(request.url)
  const dim = url.searchParams.get("dim")
  if (!isFilterKey(dim) || !dim)
    return Response.json({ error: "unknown dimension" }, { status: 400 })
  const search = Object.fromEntries(
    [...url.searchParams].filter(([key]) => key !== dim && key !== "dim")
  )
  const { timezone } = await getSiteSettings(site.id)
  const params = parseParams(search, Date.now(), timezone)
  const rows =
    dim === "event"
      ? await getEvents(site.id, params)
      : isTab(dim)
        ? await getTab(site.id, params, dim)
        : []
  return Response.json(
    { values: rows.map(({ label, value }) => ({ label, value })) },
    { headers: { "cache-control": "no-store" } }
  )
})
