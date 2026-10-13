import * as data from "@/lib/analytics/cache"
import type { Section, Tab } from "@/lib/analytics/metrics"
import type { AnalyticsParams } from "@/lib/analytics/params"
import { MapCard } from "./map-card"
import { MetricTable } from "./metric-table"
import { OverviewCards } from "./overview-cards"
import { TrafficChart } from "./traffic-chart"

export type SectionType = {
  siteId: string
  params: AnalyticsParams
  currency: string
}

const TABS: Record<
  Tab,
  { label: string; filter: string | null; value: string }
> = {
  page: { label: "Pages", filter: "page", value: "Views" },
  entry: { label: "Entry", filter: "entry", value: "Visitors" },
  exit: { label: "Exit", filter: "exit", value: "Visitors" },
  title: { label: "Titles", filter: null, value: "Views" },
  hostname: { label: "Hostnames", filter: "hostname", value: "Visitors" },
  referrer: { label: "Referrers", filter: "referrer", value: "Visitors" },
  channel: { label: "Channels", filter: "channel", value: "Visitors" },
  utm_source: { label: "Sources", filter: "utm_source", value: "Visitors" },
  utm_medium: { label: "Mediums", filter: "utm_medium", value: "Visitors" },
  utm_campaign: {
    label: "Campaigns",
    filter: "utm_campaign",
    value: "Visitors",
  },
  browser: { label: "Browsers", filter: "browser", value: "Visitors" },
  os: { label: "OS", filter: "os", value: "Visitors" },
  device: { label: "Devices", filter: "device", value: "Visitors" },
  screen: { label: "Screens", filter: "screen", value: "Visitors" },
  language: { label: "Languages", filter: "language", value: "Visitors" },
  country: { label: "Countries", filter: "country", value: "Visitors" },
  region: { label: "Regions", filter: "region", value: "Visitors" },
  city: { label: "Cities", filter: "city", value: "Visitors" },
}

const TITLES: Record<Section, string> = {
  pages: "Pages",
  sources: "Sources",
  environment: "Environment",
  location: "Location",
}

export const OverviewSection = async ({
  siteId,
  params,
  currency,
}: SectionType) => {
  const { current, previous } = await data.overview(siteId, params)
  return (
    <OverviewCards current={current} previous={previous} currency={currency} />
  )
}

export const ChartSection = async ({ siteId, params }: SectionType) => (
  <TrafficChart
    series={await data.series(siteId, params)}
    granularity={params.granularity}
  />
)

export const MetricSection = async ({
  siteId,
  params,
  name,
}: SectionType & { name: Section }) => {
  const rows = await data.section(siteId, params, name)
  const tabs = Object.entries(rows).map(([key, list]) => {
    const meta = TABS[key as Tab]
    return {
      key,
      label: meta.label,
      rows: list,
      valueLabel: meta.value,
      filter: meta.filter,
    }
  })
  return <MetricTable title={TITLES[name]} tabs={tabs} />
}

export const MapSection = async ({ siteId, params }: SectionType) => {
  const [location, points] = await Promise.all([
    data.section(siteId, params, "location"),
    data.points(siteId, params),
  ])
  return <MapCard countries={location.country ?? []} points={points} />
}
