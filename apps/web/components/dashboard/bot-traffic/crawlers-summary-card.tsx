"use client"

import { useState } from "react"
import { RobotIcon } from "@phosphor-icons/react/ssr"
import { Card } from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import type { CrawlCategory, CrawlData } from "@/lib/analytics/crawls"
import { formatNumber } from "../format"
import { NoData } from "../no-data"
import { CardFooterLink } from "../report/card-footer-link"
import { CATEGORIES, CrawlerLogo, crawlerName } from "./crawler-meta"

const LIMIT = 9

type CrawlersSummaryCardType = { data: CrawlData }

export const CrawlersSummaryCard = ({ data }: CrawlersSummaryCardType) => {
  const busiest = [...CATEGORIES].sort(
    (a, b) => data.totals[b.key] - data.totals[a.key]
  )[0]!.key
  const [tab, setTab] = useState<CrawlCategory>(busiest)
  const rows = data.crawlers.filter((c) => c.category === tab).slice(0, LIMIT)
  const max = Math.max(1, ...rows.map((c) => c.hits))

  return (
    <Card className="h-[29rem] gap-2.5 pt-3 pb-2">
      <div className="px-4">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as CrawlCategory)}
        >
          <TabsList variant="line" aria-label="AI crawlers">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.key} value={c.key} className="flex-none">
                {c.label}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatNumber(data.totals[c.key])}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {data.total === 0 ? (
        <NoData
          icon={RobotIcon}
          title="No AI crawlers yet"
          description="Report crawls from your server to see ChatGPT, Claude or Perplexity here."
          className="mx-4 flex-1 border-dashed"
        />
      ) : (
        <div className="flex min-h-0 flex-col gap-1 px-3">
          <div className="flex justify-between px-1 text-xs font-medium text-muted-foreground">
            <span>Crawler</span>
            <span>Hits</span>
          </div>
          <ul className="flex flex-col gap-1">
            {rows.map((c) => (
              <li
                key={c.crawler}
                className="relative flex h-8 items-center gap-2 rounded-md px-2 text-sm"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-md bg-dataviz/20"
                  style={{ width: `${(c.hits / max) * 100}%` }}
                />
                <CrawlerLogo crawler={c.crawler} className="relative size-4" />
                <span className="relative min-w-0 flex-1 truncate">
                  {crawlerName(c.crawler)}
                  <span className="ms-2 text-muted-foreground max-sm:hidden">
                    {c.company}
                  </span>
                </span>
                <span className="relative font-medium tabular-nums">
                  {formatNumber(c.hits)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-auto flex justify-center">
        <CardFooterLink label="Details" path="/dashboard/bots" />
      </div>
    </Card>
  )
}
