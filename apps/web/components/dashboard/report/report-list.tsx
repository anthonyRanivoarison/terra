"use client"

import { FileTextIcon } from "@phosphor-icons/react/ssr"
import { cn } from "@workspace/ui/lib/utils"
import type { MetricRow } from "@/lib/analytics/metrics"
import { NoData } from "../no-data"
import { ReportRow } from "./report-row"
import { linkFor, type ReportTab } from "./types"

type ReportListType = {
  tab: ReportTab
  rows: MetricRow[]
  domain: string
  className?: string
}

export const ReportList = ({
  tab,
  rows,
  domain,
  className,
}: ReportListType) => {
  const max = Math.max(1, ...tab.rows.map((r) => r.value))
  const total = tab.rows.reduce((sum, r) => sum + r.value, 0)

  if (rows.length === 0)
    return (
      <div className="flex flex-1 px-3">
        <NoData
          icon={FileTextIcon}
          title={`No ${tab.label.toLowerCase()} yet`}
          description="Nothing was recorded for this period and these filters."
          className="border-0"
        />
      </div>
    )

  return (
    <div className={cn("flex min-h-0 flex-col gap-1", className)}>
      <div className="flex justify-between px-2 text-xs font-medium text-muted-foreground">
        <span>{tab.label}</span>
        <span>{tab.valueLabel}</span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <ReportRow
            key={row.label}
            row={row}
            kind={tab.key}
            filter={tab.filter}
            max={max}
            total={total}
            href={linkFor(tab.key, row.label, domain)}
          />
        ))}
      </ul>
    </div>
  )
}
