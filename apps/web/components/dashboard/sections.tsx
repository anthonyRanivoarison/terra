import * as data from "@/lib/analytics/cache"
import type { MetricRow, Section, Tab } from "@/lib/analytics/metrics"
import type { AnalyticsParams } from "@/lib/analytics/params"
import { MainChart } from "./overview/main-chart"
import { StatStrip } from "./overview/stat-strip"
import { LocationMap } from "./report/location-map"
import { ReportCard } from "./report/report-card"
import type { ReportTab } from "./report/types"

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
  location: "Locations",
}

const toTabs = (rows: Record<string, MetricRow[]>): ReportTab[] =>
  Object.entries(rows).map(([key, list]) => {
    const meta = TABS[key as Tab]
    return {
      key,
      label: meta.label,
      rows: list,
      valueLabel: meta.value,
      filter: meta.filter,
    }
  })

export const OverviewSection = async ({
  siteId,
  params,
  currency,
}: SectionType) => {
  const [{ current, previous }, series] = await Promise.all([
    data.overview(siteId, params),
    data.series(siteId, params),
  ])
  return (
    <StatStrip
      current={current}
      previous={previous}
      points={series.current}
      currency={currency}
    />
  )
}

export const ChartSection = async ({
  siteId,
  params,
  currency,
}: SectionType) => (
  <MainChart
    series={await data.series(siteId, params)}
    granularity={params.granularity}
    currency={currency}
  />
)

export const MetricSection = async ({
  siteId,
  params,
  name,
  domain,
}: SectionType & { name: Section; domain: string }) => {
  const rows = await data.section(siteId, params, name, 100)
  if (name !== "location")
    return (
      <ReportCard title={TITLES[name]} tabs={toTabs(rows)} domain={domain} />
    )
  const points = await data.points(siteId, params)
  return (
    <ReportCard
      title={TITLES[name]}
      tabs={toTabs(rows)}
      domain={domain}
      extras={[
        {
          key: "map",
          label: "Map",
          content: (
            <LocationMap countries={rows.country ?? []} points={points} />
          ),
        },
      ]}
    />
  )
}
