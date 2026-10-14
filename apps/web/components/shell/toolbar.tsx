"use client"

import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { DateRange } from "@/components/dashboard/date-range"
import { FilterChips } from "@/components/dashboard/filter-chips"
import { OnlineBadge } from "@/components/dashboard/online-badge"
import { RefreshButton } from "@/components/dashboard/refresh-button"
import type { AnalyticsParams } from "@/lib/analytics/params"
import { FilterPicker } from "./filter-picker"
import { PeriodStepper } from "./period-stepper"

type ToolbarType = {
  title?: string
  params?: AnalyticsParams
  from?: string | null
  to?: string | null
  refresh?: () => Promise<void>
}

export const Toolbar = ({
  title,
  params,
  from = null,
  to = null,
  refresh,
}: ToolbarType) => (
  <header className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {title && <h1 className="sr-only">{title}</h1>}
        {params && <FilterPicker />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <OnlineBadge />
        {refresh && <RefreshButton action={refresh} />}
        {params && (
          <>
            <DateRange
              range={params.range}
              from={from}
              to={to}
              compare={params.compare}
            />
            <PeriodStepper params={params} />
          </>
        )}
      </div>
    </div>
    {params && <FilterChips filters={params.filters} />}
  </header>
)
