"use client"

import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { DAYS, REVENUE, formatMoney } from "./demo-data"

const WIDTH = 560
const HEIGHT = 200
const GAP = 6
const STEP = WIDTH / REVENUE.length
const MAX = 10000
const GRID = [2500, 5000, 7500, 10000]

export const DemoChart = () => {
  const [active, setActive] = useState(REVENUE.length - 1)

  return (
    <figure className="min-w-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-sm font-medium text-foreground">
          Revenue per day
        </span>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {DAYS[active]} ·{" "}
          <span className="text-foreground">
            {formatMoney(REVENUE[active]!)}
          </span>
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`}
        role="img"
        aria-label={`Revenue per day over 14 days, from ${formatMoney(Math.min(...REVENUE))} to ${formatMoney(Math.max(...REVENUE))}, highest today.`}
        className="mt-4 block h-auto w-full overflow-visible"
        onMouseLeave={() => setActive(REVENUE.length - 1)}
      >
        {GRID.map((line) => {
          const y = HEIGHT - (line / MAX) * HEIGHT
          return (
            <g key={line}>
              <line
                x1={0}
                x2={WIDTH}
                y1={y}
                y2={y}
                className="stroke-foreground/[0.07]"
              />
              <text
                x={0}
                y={y - 5}
                className="fill-muted-foreground font-mono text-[10px]"
              >
                {line / 1000}k
              </text>
            </g>
          )
        })}
        <line
          x1={0}
          x2={WIDTH}
          y1={HEIGHT}
          y2={HEIGHT}
          className="stroke-foreground/20"
        />
        {REVENUE.map((value, index) => {
          const height = (value / MAX) * HEIGHT
          const x = index * STEP + GAP / 2
          return (
            <g key={index} onMouseEnter={() => setActive(index)}>
              <rect
                x={index * STEP}
                y={0}
                width={STEP}
                height={HEIGHT}
                fill="transparent"
              />
              <path
                data-bar
                d={`M${x},${HEIGHT} V${HEIGHT - height + 4} q0,-4 4,-4 h${STEP - GAP - 8} q4,0 4,4 V${HEIGHT} Z`}
                className={cn(
                  "origin-bottom transition-opacity duration-200 [transform-box:fill-box]",
                  index === active ? "fill-[#f59e0b]" : "fill-[#f59e0b]/55"
                )}
              />
              {index % 2 === 1 ? (
                <text
                  x={x + (STEP - GAP) / 2}
                  y={HEIGHT + 17}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {DAYS[index]}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
