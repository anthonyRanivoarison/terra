import { Card } from "@workspace/ui/components/card"
import type { Overview } from "@/lib/analytics/overview"
import { cn } from "@workspace/ui/lib/utils"
import { Delta } from "./delta"
import { MetricHint } from "./metric-hint"
import {
  formatDuration,
  formatMoney,
  formatNumber,
  formatPercent,
} from "./format"

const METRICS: {
  key: keyof Overview
  label: string
  format: (n: number, currency: string) => string
  invert?: boolean
}[] = [
  { key: "visitors", label: "Visitors", format: formatNumber },
  { key: "visits", label: "Visits", format: formatNumber },
  { key: "views", label: "Views", format: formatNumber },
  {
    key: "bounceRate",
    label: "Bounce rate",
    format: formatPercent,
    invert: true,
  },
  { key: "visitDuration", label: "Visit duration", format: formatDuration },
  { key: "revenueCents", label: "Revenue", format: formatMoney },
  { key: "conversionRate", label: "Conversion", format: formatPercent },
]

type OverviewCardsType = {
  current: Overview
  previous: Overview
  currency: string
}

export const OverviewCards = ({
  current,
  previous,
  currency,
}: OverviewCardsType) => (
  <Card className="gap-0 overflow-hidden py-0">
    <dl className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7">
      {METRICS.map((m, i) => (
        <div
          key={m.key}
          className={cn(
            "group flex min-w-0 flex-col gap-1.5 border-b p-4 sm:p-5 xl:border-b-0",
            i > 0 && "xl:border-l",
            i % 2 === 1 && "border-l",
            i % 4 !== 0 && "sm:border-l"
          )}
        >
          <dt className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            {m.label}
            <MetricHint metric={m.key} />
          </dt>
          <dd className="text-2xl font-semibold tracking-tight tabular-nums">
            {m.format(current[m.key], currency)}
          </dd>
          <dd>
            <Delta
              current={current[m.key]}
              previous={previous[m.key]}
              invert={m.invert}
            />
          </dd>
        </div>
      ))}
    </dl>
  </Card>
)

export const OverviewSkeleton = () => (
  <Card className="h-[13.5rem] animate-pulse py-0 sm:h-[9.5rem] xl:h-[6.75rem]" />
)
