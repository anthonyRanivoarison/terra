import { Delta } from "@/components/dashboard/delta"
import { formatMoney, formatNumber } from "@/components/dashboard/format"
import type { SiteOverview } from "@/lib/sites-overview"

type PortfolioSummaryType = {
  overviews: SiteOverview[]
  liveCount: number
  total: number
}

export const PortfolioSummary = ({
  overviews,
  liveCount,
  total,
}: PortfolioSummaryType) => {
  const sum = (pick: (o: SiteOverview) => number) =>
    overviews.reduce((acc, o) => acc + pick(o), 0)
  const visitors = sum((o) => o.visitors)
  const previous = sum((o) => o.previousVisitors)
  const items = [
    {
      label: "Visitors, last 7 days",
      value: formatNumber(visitors),
      extra: <Delta current={visitors} previous={previous} />,
    },
    {
      label: "Revenue, last 7 days",
      value: formatMoney(sum((o) => o.revenueCents)),
      extra: null,
    },
    {
      label: "Online now",
      value: formatNumber(sum((o) => o.online)),
      extra: null,
    },
    { label: "Sites live", value: `${liveCount} / ${total}`, extra: null },
  ]

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-1 p-4 sm:p-5 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
        >
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="flex items-center gap-2 font-heading text-2xl font-semibold tabular-nums">
            {item.value}
            {item.extra}
          </dd>
        </div>
      ))}
    </dl>
  )
}
