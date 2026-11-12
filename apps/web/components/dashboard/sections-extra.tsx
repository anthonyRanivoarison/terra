import * as data from "@/lib/analytics/cache"
import { loadCrawls } from "./bot-traffic/bot-traffic-section"
import { CrawlersSummaryCard } from "./bot-traffic/crawlers-summary-card"
import { EventsCard } from "./events-card"
import { FunnelCard } from "./funnel-card"
import { HeatmapCard } from "./heatmap-card"
import { RevenueCard } from "./revenue-card"
import type { SectionType } from "./sections"
import { TrafficQualityCard } from "./traffic-quality-card"
import { VitalsCard } from "./vitals-card"

export const EventsSection = async ({ siteId, params }: SectionType) => (
  <EventsCard events={await data.events(siteId, params)} />
)

export const RevenueSection = async ({
  siteId,
  params,
  currency,
}: SectionType) => (
  <RevenueCard
    attribution={await data.attribution(siteId, params)}
    currency={currency}
  />
)

export const FunnelSection = async ({
  siteId,
  params,
  currency,
}: SectionType) => (
  <FunnelCard funnel={await data.funnel(siteId, params)} currency={currency} />
)

export const VitalsSection = async ({ siteId, params }: SectionType) => {
  const { vitals, scores } = await data.vitals(siteId, params)
  return <VitalsCard vitals={vitals} scores={scores} />
}

export const HeatmapSection = async ({ siteId, params }: SectionType) => (
  <HeatmapCard cells={await data.heatmap(siteId, params)} tz={params.tz} />
)

export const QualitySection = async ({ siteId, params }: SectionType) => {
  const { networks, bots } = await data.quality(siteId, params)
  return <TrafficQualityCard networks={networks} bots={bots} />
}

export const CrawlersSection = async ({ siteId, params }: SectionType) => (
  <CrawlersSummaryCard
    data={await loadCrawls(siteId, {
      from: params.current.from,
      to: params.current.to,
      granularity: params.granularity,
      tz: params.tz,
    })}
  />
)
