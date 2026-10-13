"use client"

import { useState } from "react"
import { FileText, Globe, Link2, Monitor, type LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { MetricRow } from "@/lib/analytics/metrics"
import { cn } from "@workspace/ui/lib/utils"
import { DimensionIcon } from "./dimension-icon"
import { dimensionLabel, formatNumber } from "./format"
import { useAnalyticsNav } from "./nav-context"
import { NoData } from "./no-data"

const ICONS: Record<string, LucideIcon> = {
  Pages: FileText,
  Sources: Link2,
  Environment: Monitor,
  Location: Globe,
}

export type MetricTab = {
  key: string
  label: string
  rows: MetricRow[]
  valueLabel: string
  filter: string | null
}

type MetricTableType = { title: string; tabs: MetricTab[] }

export const MetricTable = ({ title, tabs }: MetricTableType) => {
  const [active, setActive] = useState(tabs[0]?.key)
  const { update, get } = useAnalyticsNav()
  const tab = tabs.find((t) => t.key === active) ?? tabs[0]
  if (!tab) return null
  const max = Math.max(1, ...tab.rows.map((r) => r.value))

  return (
    <Card className="h-[29rem] gap-3 overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {tabs.length > 1 && (
          <div role="tablist" className="flex flex-wrap gap-1 text-sm">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={t.key === tab.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "rounded-md px-2 py-1 transition-colors",
                  t.key === tab.key
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <div className="flex justify-between px-6 text-xs font-medium text-muted-foreground">
        <span>{tab.label}</span>
        <span>{tab.valueLabel}</span>
      </div>
      {tab.rows.length === 0 && (
        <div className="flex flex-1 px-4 pb-4">
          <NoData
            icon={ICONS[title] ?? FileText}
            title={`No ${tab.label.toLowerCase()} yet`}
            description="Nothing was recorded for this period and these filters."
          />
        </div>
      )}
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 empty:hidden">
        {tab.rows.map((row) => {
          const active = tab.filter !== null && get(tab.filter) === row.label
          return (
            <li key={row.label}>
              <button
                type="button"
                disabled={!tab.filter}
                onClick={() =>
                  tab.filter &&
                  update({ [tab.filter]: active ? null : row.label })
                }
                className={cn(
                  "relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm transition-colors enabled:hover:bg-muted/60",
                  active && "ring-1 ring-primary"
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
                <span className="relative flex min-w-0 items-center gap-2">
                  <DimensionIcon kind={tab.key} value={row.label} />
                  <span className="truncate">
                    {dimensionLabel(tab.key, row.label)}
                  </span>
                </span>
                <span className="relative font-medium tabular-nums">
                  {formatNumber(row.value)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export const MetricTableSkeleton = () => (
  <Card className="h-[29rem] animate-pulse" />
)
