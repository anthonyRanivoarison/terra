import type { CSSProperties } from "react"
import { CrawlerChart } from "./crawler-chart"
import { CrawlerLogo } from "./crawler-meta"
import { PALETTE } from "./palette"
import {
  SAMPLE_BUCKETS,
  SAMPLE_CRAWLERS,
  SAMPLE_PAGES,
  sampleTotal,
} from "./sample-data"

const dot = (i: number) =>
  ({
    "--dot-light": PALETTE[i % PALETTE.length]!.light,
    "--dot-dark": PALETTE[i % PALETTE.length]!.dark,
  }) as CSSProperties

const totals = SAMPLE_CRAWLERS.map((c) => sampleTotal(c.values))

export const BotTrafficSample = () => (
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
    <div className="relative flex flex-col gap-3">
      <CrawlerChart
        buckets={SAMPLE_BUCKETS}
        granularity="day"
        lines={SAMPLE_CRAWLERS}
      />
      <div className="absolute top-4 right-6 hidden w-44 flex-col gap-1.5 rounded-lg border bg-popover p-3 text-xs shadow-md sm:flex">
        <span className="font-medium">Jun 13</span>
        {SAMPLE_CRAWLERS.map((c, i) => (
          <span key={c.key} className="flex items-center gap-2">
            <span
              className="bg-(--dot-light)) size-2 rounded-full"
              style={dot(i)}
            />
            <span className="flex-1 text-muted-foreground">{c.label}</span>
            <span className="tabular-nums">{totals[i]}</span>
          </span>
        ))}
        <span className="flex justify-between border-t pt-1.5 font-medium">
          Total
          <span className="tabular-nums">{sampleTotal(totals)}</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {SAMPLE_CRAWLERS.map((c, i) => (
          <li
            key={c.key}
            className="flex items-center gap-3 rounded-md px-2 py-1.5"
          >
            <span className="flex size-6 items-center justify-center rounded-md border bg-background">
              <CrawlerLogo crawler={c.key} className="size-3.5" />
            </span>
            <span
              className="bg-(--dot-light)) size-2 rounded-full"
              style={dot(i)}
            />
            <span className="flex-1 font-medium">{c.label}</span>
            <span className="font-mono text-[13px] tabular-nums">
              {totals[i]}
            </span>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
          <CrawlerLogo crawler="chatgpt-user" className="size-4.5" />
        </span>
        <div>
          <p className="font-heading font-semibold">ChatGPT</p>
          <p className="text-xs text-muted-foreground">OpenAI</p>
        </div>
      </div>
      <div>
        <p className="font-heading text-2xl font-semibold tabular-nums">1.4k</p>
        <p className="text-xs text-muted-foreground">
          crawls · Last 7 days · AI answers
        </p>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {SAMPLE_PAGES.map((p) => (
          <li
            key={p.path}
            className="flex justify-between gap-3 rounded-md bg-muted/40 px-2 py-1"
          >
            <span className="truncate font-mono text-xs">{p.path}</span>
            <span className="text-xs tabular-nums">{p.hits}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)
