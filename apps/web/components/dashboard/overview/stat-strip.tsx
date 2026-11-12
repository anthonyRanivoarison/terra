"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { Overview } from "@/lib/analytics/overview"
import { Delta } from "../delta"
import { MetricHint } from "../metric-hint"
import { STATS, useSelectedStat } from "./stats"

type StatStripType = {
  current: Overview
  previous: Overview
  currency: string
}

export const StatStrip = ({ current, previous, currency }: StatStripType) => {
  const { stat: selected, select } = useSelectedStat()
  return (
    <div className="grid grid-cols-2 gap-1 p-1.5 sm:grid-cols-3 lg:grid-cols-5">
      {STATS.map((stat, i) => {
        const active = stat.key === selected.key
        return (
          <div
            key={stat.key}
            className={cn(
              "relative flex min-w-0 flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors",
              active ? "bg-muted" : "hover:bg-muted/50",
              i === STATS.length - 1 && "max-sm:col-span-2"
            )}
          >
            <button
              type="button"
              aria-pressed={active}
              onClick={() => select(stat.key)}
              className="absolute inset-0 z-10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="sr-only">Chart {stat.label}</span>
            </button>
            <span className="flex min-w-0 items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full bg-dataviz transition-opacity",
                  !active && "opacity-0"
                )}
              />
              <span className="truncate">{stat.label}</span>
              <span className="relative z-20 hidden xl:inline-flex">
                <MetricHint metric={stat.key} />
              </span>
            </span>
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="truncate text-2xl leading-tight font-semibold tracking-tight tabular-nums">
                {stat.format(current[stat.key], currency)}
              </span>
              <Delta
                current={current[stat.key]}
                previous={previous[stat.key]}
                invert={"invert" in stat}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const StatStripSkeleton = () => (
  <div className="h-[8.5rem] animate-pulse sm:h-[8.5rem] lg:h-[4.75rem]" />
)
