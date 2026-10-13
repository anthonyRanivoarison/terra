import { getCrawls, type CrawlData } from "@/lib/analytics/crawls"
import { BotTrafficCard } from "./bot-traffic-card"

type BotTrafficSectionType = {
  siteId: string
  from: string
  to: string
  granularity: "hour" | "day" | "month"
  tz?: string
  setupHref?: string
}

const EMPTY: CrawlData = {
  total: 0,
  totals: { answers: 0, indexing: 0, training: 0 },
  crawlerCount: 0,
  crawlers: [],
  buckets: [],
  series: {},
  pages: {},
  files: [],
}

export const BotTrafficSection = async ({
  siteId,
  from,
  to,
  granularity,
  tz,
  setupHref,
}: BotTrafficSectionType) => {
  const data = await getCrawls(siteId, { from, to, granularity, tz }).catch(
    (error: unknown) => {
      console.error("[bot-traffic] query failed", error)
      return EMPTY
    }
  )
  return (
    <BotTrafficCard
      siteId={siteId}
      data={data}
      granularity={granularity}
      setupHref={setupHref}
    />
  )
}
