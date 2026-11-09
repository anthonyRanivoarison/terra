"use client"

import { useMemo, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { CrawlCategory, CrawlData } from "@/lib/analytics/crawls"
import { useLocalFlag } from "../empty/use-local-flag"
import { formatNumber } from "../format"
import { BotTrafficEmpty } from "./bot-traffic-empty"
import { CrawlerChart } from "./crawler-chart"
import { CrawlerFiles } from "./crawler-files"
import { CrawlerList } from "./crawler-list"
import { CATEGORIES, crawlerName } from "./crawler-meta"
import { CrawlerPanel } from "./crawler-panel"

const CHARTED = 5

type BotTrafficCardType = {
  siteId: string
  data: CrawlData
  granularity: string
  setupHref?: string
}

export const BotTrafficCard = ({
  siteId,
  data,
  granularity,
  setupHref = "#bot-tracking",
}: BotTrafficCardType) => {
  const busiest = useMemo(
    () =>
      [...CATEGORIES].sort((a, b) => data.totals[b.key] - data.totals[a.key])[0]
        ?.key ?? "answers",
    [data.totals]
  )
  const [hidden, setHidden] = useLocalFlag(`terra:hide-bot-card:${siteId}`)
  const [tab, setTab] = useState<CrawlCategory>(busiest)
  const [selected, setSelected] = useState<string | null>(null)
  const inTab = data.crawlers.filter((c) => c.category === tab)
  const stat = data.crawlers.find((c) => c.crawler === selected) ?? null
  const colorIndex = Math.max(
    0,
    data.crawlers
      .filter((c) => c.category === stat?.category)
      .findIndex((c) => c.crawler === selected)
  )

  if (data.total === 0 && hidden) return null

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Bot traffic</CardTitle>
        <CardDescription>
          AI assistants, search engines and training crawlers reading your site
        </CardDescription>
        {data.total === 0 && (
          <CardAction>
            <Badge variant="secondary" className="tabular-nums">
              0 crawlers
            </Badge>
          </CardAction>
        )}
        {data.total > 0 && (
          <CardAction className="flex items-center gap-2">
            <Badge variant="secondary" className="tabular-nums">
              {data.crawlerCount}{" "}
              {data.crawlerCount === 1 ? "crawler" : "crawlers"}
            </Badge>
            <Badge variant="outline" className="tabular-nums">
              {formatNumber(data.total)} crawls
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {data.total === 0 ? (
          <BotTrafficEmpty
            setupHref={setupHref}
            onHide={() => setHidden(true)}
          />
        ) : (
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as CrawlCategory)}
          >
            <TabsList variant="line" className="w-full justify-start">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.key} value={c.key} className="flex-none">
                  {c.label}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatNumber(data.totals[c.key])}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((c) => (
              <TabsContent
                key={c.key}
                value={c.key}
                className="flex flex-col gap-4 pt-2"
              >
                <p className="text-sm text-muted-foreground">{c.hint}</p>
                {inTab.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                    No {c.label.toLowerCase()} crawlers in this period.
                  </p>
                ) : (
                  <>
                    <CrawlerChart
                      buckets={data.buckets}
                      granularity={granularity}
                      lines={inTab.slice(0, CHARTED).map((s) => ({
                        key: s.crawler,
                        label: crawlerName(s.crawler),
                        values: data.series[s.crawler] ?? [],
                      }))}
                    />
                    <CrawlerList
                      crawlers={inTab}
                      charted={CHARTED}
                      onSelect={setSelected}
                    />
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
        {data.total > 0 && <CrawlerFiles files={data.files} />}
      </CardContent>
      <CrawlerPanel
        stat={stat}
        data={data}
        granularity={granularity}
        colorIndex={colorIndex}
        onClose={() => setSelected(null)}
      />
    </Card>
  )
}
