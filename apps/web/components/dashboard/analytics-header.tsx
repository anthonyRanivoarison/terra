import type { AnalyticsParams } from "@/lib/analytics/params"
import { AnalyticsTabs } from "./analytics-tabs"
import { CompareToggle } from "./compare-toggle"
import { DateRange } from "./date-range"
import { FilterChips } from "./filter-chips"
import { OnlineBadge } from "./online-badge"
import { RefreshButton } from "./refresh-button"
import { SiteSwitcher, type SwitcherSite } from "./site-switcher"

type AnalyticsHeaderType = {
  sites: SwitcherSite[]
  description: string
  refresh?: () => Promise<void>
  params?: AnalyticsParams
  from?: string | null
  to?: string | null
}

export const AnalyticsHeader = ({
  sites,
  description,
  refresh,
  params,
  from = null,
  to = null,
}: AnalyticsHeaderType) => (
  <header className="flex flex-col gap-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="sr-only">Dashboard</h1>
        <SiteSwitcher sites={sites} />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <OnlineBadge />
        {refresh && <RefreshButton action={refresh} />}
      </div>
    </div>
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b">
      <AnalyticsTabs />
      {params && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <CompareToggle compare={params.compare} />
          <DateRange range={params.range} from={from} to={to} />
        </div>
      )}
    </div>
    {params && <FilterChips filters={params.filters} />}
  </header>
)
