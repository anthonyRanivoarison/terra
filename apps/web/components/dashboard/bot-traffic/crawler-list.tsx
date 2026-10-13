"use client"

import { ChevronRight } from "lucide-react"
import type { CSSProperties } from "react"
import type { CrawlerStat } from "@/lib/analytics/crawls"
import { formatNumber } from "../format"
import { PALETTE } from "./palette"
import { CrawlerLogo, crawlerName } from "./crawler-meta"
import { VerifiedBadge } from "./verified-badge"

type CrawlerListType = {
  crawlers: CrawlerStat[]
  charted: number
  onSelect: (crawler: string) => void
}

export const CrawlerList = ({
  crawlers,
  charted,
  onSelect,
}: CrawlerListType) => {
  const max = Math.max(1, ...crawlers.map((c) => c.hits))
  return (
    <ul className="flex flex-col gap-1">
      {crawlers.map((c, i) => (
        <li key={c.crawler}>
          <button
            type="button"
            onClick={() => onSelect(c.crawler)}
            className="group relative flex w-full items-center gap-3 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-md bg-primary/8"
              style={{ width: `${(c.hits / max) * 100}%` }}
            />
            <span className="relative flex size-6 items-center justify-center rounded-md border bg-background">
              <CrawlerLogo crawler={c.crawler} className="size-3.5" />
            </span>
            <span className="relative flex min-w-0 flex-1 items-center gap-2">
              {i < charted && (
                <span
                  aria-hidden="true"
                  className="bg-(--dot-light)) size-2 shrink-0 rounded-full"
                  style={
                    {
                      "--dot-light": PALETTE[i % PALETTE.length]!.light,
                      "--dot-dark": PALETTE[i % PALETTE.length]!.dark,
                    } as CSSProperties
                  }
                />
              )}
              <span className="truncate font-medium">
                {crawlerName(c.crawler)}
              </span>
              <span className="hidden truncate text-muted-foreground sm:inline">
                {c.company}
              </span>
            </span>
            <span className="relative hidden sm:block">
              <VerifiedBadge share={c.verifiedShare} compact />
            </span>
            <span className="relative w-14 text-right font-mono text-[13px] tabular-nums">
              {formatNumber(c.hits)}
            </span>
            <ChevronRight
              aria-hidden
              className="relative size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
