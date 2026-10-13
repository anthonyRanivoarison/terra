"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import type { CrawlData, CrawlerStat } from "@/lib/analytics/crawls"
import { formatNumber } from "../format"
import { CrawlerChart } from "./crawler-chart"
import { CATEGORIES, CrawlerLogo, crawlerName } from "./crawler-meta"
import { VerifiedBadge } from "./verified-badge"

type CrawlerPanelType = {
  stat: CrawlerStat | null
  data: CrawlData
  granularity: string
  colorIndex: number
  onClose: () => void
}

const lastSeen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

export const CrawlerPanel = ({
  stat,
  data,
  granularity,
  colorIndex,
  onClose,
}: CrawlerPanelType) => {
  const [query, setQuery] = useState("")
  const id = stat?.crawler ?? ""
  const pages = data.pages[id] ?? []
  const needle = query.trim().toLowerCase()
  const shown = needle
    ? pages.filter((p) => p.path.toLowerCase().includes(needle))
    : pages
  const category = CATEGORIES.find((c) => c.key === stat?.category)

  return (
    <Sheet
      open={stat !== null}
      onOpenChange={(open) => {
        if (!open) {
          setQuery("")
          onClose()
        }
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {stat && (
          <>
            <SheetHeader className="flex-row items-center gap-3 border-b">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <CrawlerLogo crawler={id} className="size-5" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate font-heading">
                  {crawlerName(id)}
                </SheetTitle>
                <SheetDescription>
                  {stat.company} · {category?.label}
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">Crawls</dt>
                  <dd className="font-heading text-2xl font-semibold tabular-nums">
                    {formatNumber(stat.hits)}
                  </dd>
                </div>
                <div className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">Last seen</dt>
                  <dd className="mt-1.5 text-sm font-medium">
                    {lastSeen(stat.lastAt)}
                  </dd>
                </div>
              </dl>
              <VerifiedBadge share={stat.verifiedShare} />
              <CrawlerChart
                buckets={data.buckets}
                granularity={granularity}
                colorOffset={colorIndex}
                className="h-40 w-full"
                lines={[
                  {
                    key: id,
                    label: crawlerName(id),
                    values: data.series[id] ?? [],
                  },
                ]}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Pages requested</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {shown.length} of {pages.length}
                  </span>
                </div>
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter pages"
                    aria-label="Filter pages"
                    className="pl-8"
                  />
                </div>
                <ul className="flex flex-col divide-y rounded-lg border">
                  {shown.map((page) => (
                    <li
                      key={page.path}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[13px]">
                        {page.path}
                      </span>
                      {page.errors > 0 && (
                        <span className="text-xs text-destructive tabular-nums">
                          {page.errors} err
                        </span>
                      )}
                      <span className="font-mono text-[13px] tabular-nums">
                        {formatNumber(page.hits)}
                      </span>
                    </li>
                  ))}
                  {shown.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No page matches “{query}”
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
