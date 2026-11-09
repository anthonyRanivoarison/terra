"use client"

import { useId } from "react"
import { cn } from "@workspace/ui/lib/utils"

type SparklineType = {
  values: number[]
  label: string
  className?: string
  dot?: boolean
}

const W = 280
const H = 64

export const Sparkline = ({
  values,
  label,
  className,
  dot = false,
}: SparklineType) => {
  const id = useId()
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? W / (values.length - 1) : W
  const points = values.map(
    (v, i) => [i * step, H - 4 - (v / max) * (H - 10)] as const
  )
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${W} ${H} L0 ${H} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className={cn("h-16 w-full overflow-visible text-dataviz", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {values.length > 0 && (
        <>
          <path d={area} fill={`url(#${id})`} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
      {dot && last && (
        <circle cx={last[0]} cy={last[1]} r="3" fill="currentColor" />
      )}
    </svg>
  )
}
