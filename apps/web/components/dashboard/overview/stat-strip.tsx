"use client"

import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Sparkline } from "@/components/charts/sparkline"
import type { Overview } from "@/lib/analytics/overview"
import type { SeriesPoint } from "@/lib/analytics/series"
import { Delta } from "../delta"
import { MetricHint } from "../metric-hint"
import { STATS, useSelectedStat } from "./stats"

type StatStripType = {
  current: Overview
  previous: Overview
  points: SeriesPoint[]
  currency: string
}

export const StatStrip = ({
  current,
  previous,
  points,
  currency,
}: StatStripType) => {
  const { stat: selected, select } = useSelectedStat()
  return (
    <Card className="gap-0 py-0">
      <div className="-mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((stat, i) => {
          const active = stat.key === selected.key
          return (
            <div
              key={stat.key}
              className={cn(
                "group relative flex min-w-0 flex-col border-b transition-colors lg:border-b-0",
                i > 0 && "border-l",
                i % 2 === 0 && "max-sm:border-l-0",
                i % 3 === 0 && "sm:max-lg:border-l-0",
                active ? "bg-muted/60" : "hover:bg-muted/30",
                i === STATS.length - 1 && "max-sm:col-span-2"
              )}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => select(stat.key)}
                className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <span className="sr-only">Chart {stat.label}</span>
              </button>
              <div className="flex flex-col gap-1 px-3 pt-3 xl:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-sm font-medium text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1">
                    <span>{stat.label}</span>
                    <span className="relative z-20 hidden xl:inline-flex">
                      <MetricHint metric={stat.key} />
                    </span>
                  </span>
                  <Delta
                    current={current[stat.key]}
                    previous={previous[stat.key]}
                    invert={"invert" in stat}
                  />
                </div>
                <span className="truncate text-2xl leading-tight font-medium tracking-tight tabular-nums xl:text-[1.75rem]">
                  {stat.format(current[stat.key], currency)}
                </span>
              </div>
              <Sparkline
                values={points.map((p) => p[stat.key])}
                label={`${stat.label} over the period`}
                className={cn(
                  "mt-auto h-12 transition-opacity",
                  !active && "opacity-60 group-hover:opacity-100"
                )}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export const StatStripSkeleton = () => (
  <Card className="h-[11rem] animate-pulse py-0 sm:h-[11rem] lg:h-[7.25rem]" />
)
