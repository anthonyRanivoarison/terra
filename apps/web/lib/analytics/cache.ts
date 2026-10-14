import { cache } from "react"
import { revalidateTag, unstable_cache } from "next/cache"
import { getFunnel } from "./funnel"
import { getHeatmap, getPoints, getQuality, getVitals } from "./insights"
import { getEvents, getSection, type Section } from "./metrics"
import { getOverview } from "./overview"
import { FRESHNESS, type AnalyticsParams } from "./params"
import { getOnline, getRealtime } from "./realtime"
import { getAttribution } from "./revenue"
import { getSeries } from "./series"
import { getVisit, getVisits } from "./sessions"

const TAG = "analytics"

export const siteTag = (siteId: string) => `${TAG}:${siteId}`

function cached<A extends [string, AnalyticsParams, ...unknown[]], T>(
  name: string,
  fn: (...args: A) => Promise<T>
): (...args: A) => Promise<T> {
  return cache((...args: A) =>
    unstable_cache(
      () => fn(...args),
      [`analytics:${name}`, args[0], JSON.stringify(args.slice(1))],
      { revalidate: FRESHNESS[args[1].range], tags: [TAG, siteTag(args[0])] }
    )()
  )
}

export const overview = cached("overview", getOverview)
export const series = cached("series", getSeries)
export const section = cached(
  "section",
  (siteId: string, params: AnalyticsParams, name: Section, limit?: number) =>
    getSection(siteId, params, name, limit)
)
export const events = cached("events", getEvents)
export const attribution = cached("attribution", getAttribution)
export const funnel = cached("funnel", getFunnel)
export const heatmap = cached("heatmap", getHeatmap)
export const vitals = cached("vitals", getVitals)
export const points = cached("points", getPoints)
export const quality = cached("quality", getQuality)

export const realtime = getRealtime
export const online = getOnline
export const visits = getVisits
export const visit = getVisit

export function refreshAnalytics(siteId: string): void {
  revalidateTag(siteTag(siteId), { expire: 0 })
}
