"use client"

import { SquareArrowOutUpRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { MetricRow } from "@/lib/analytics/metrics"
import { DimensionIcon } from "../dimension-icon"
import { dimensionLabel, formatNumber } from "../format"
import { useAnalyticsNav } from "../nav-context"

type ReportRowType = {
  row: MetricRow
  kind: string
  filter: string | null
  max: number
  total: number
  href: string | null
}

export const ReportRow = ({
  row,
  kind,
  filter,
  max,
  total,
  href,
}: ReportRowType) => {
  const { update, get } = useAnalyticsNav()
  const active = filter !== null && get(filter) === row.label
  const label = dimensionLabel(kind, row.label)
  const share = total > 0 ? (row.value / total) * 100 : 0

  return (
    <li
      className={cn(
        "group relative flex h-8 items-center rounded-md text-sm transition-colors hover:bg-muted/70",
        active && "ring-1 ring-primary"
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-md bg-dataviz/20"
        style={{ width: `${(row.value / max) * 100}%` }}
      />
      <button
        type="button"
        disabled={!filter || !row.label}
        onClick={() =>
          filter && update({ [filter]: active ? null : row.label })
        }
        title={label}
        className="relative flex h-full min-w-0 flex-1 items-center gap-2 rounded-md pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 enabled:cursor-pointer"
      >
        <DimensionIcon kind={kind} value={row.label} />
        <span className="truncate">{label}</span>
      </button>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label}`}
          className="relative ml-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
        >
          <SquareArrowOutUpRight className="size-4" aria-hidden />
        </a>
      )}
      <span className="relative flex shrink-0 items-center gap-2 pr-2 pl-3 tabular-nums">
        <span className="hidden text-muted-foreground group-hover:inline">
          {share.toFixed(1)}%
        </span>
        <span className="group-hover:hidden">{formatNumber(row.value)}</span>
        <span className="hidden group-hover:inline">
          {row.value.toLocaleString("en-US")}
        </span>
      </span>
    </li>
  )
}
