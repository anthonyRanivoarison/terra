import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

export type DonutSegment = { value: number; className: string; label: string }

type DonutType = {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  children?: ReactNode
  label: string
}

export const Donut = ({
  segments,
  size = 112,
  thickness = 10,
  children,
  label,
}: DonutType) => {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const gap =
    total > 0 && segments.filter((s) => s.value > 0).length > 1 ? 2 : 0
  let offset = 0

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${segments
        .map(
          (s) =>
            `${s.label} ${total ? Math.round((s.value / total) * 100) : 0}%`
        )
        .join(", ")}`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted"
        />
        {total > 0 &&
          segments.map((segment) => {
            const length = (segment.value / total) * circumference
            const dash = Math.max(0, length - gap)
            const circle = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className={cn(
                  "transition-[stroke-dasharray] duration-700 ease-out",
                  segment.className
                )}
              />
            )
            offset += length
            return segment.value > 0 ? circle : null
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
