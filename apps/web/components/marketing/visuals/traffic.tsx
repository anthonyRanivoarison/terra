import { DimensionIcon } from "@/components/dashboard/dimension-icon"
import { Sparkline } from "@/components/charts/sparkline"
import { VISITORS, formatCount } from "@/components/landing/demo-data"

const total = VISITORS.reduce((s, v) => s + v, 0)

const countries = [
  { code: "US", name: "United States", share: 0.31 },
  { code: "FR", name: "France", share: 0.18 },
  { code: "DE", name: "Germany", share: 0.11 },
  { code: "MG", name: "Madagascar", share: 0.06 },
]

export const TrafficVisual = () => (
  <figure className="flex flex-col gap-4">
    <div className="flex items-end justify-between gap-4">
      <div>
        <figcaption className="text-sm text-muted-foreground">
          Visitors, last 14 days
        </figcaption>
        <p className="marketing-accent mt-1 text-3xl tabular-nums">
          {formatCount(total)}
        </p>
      </div>
      <span className="rounded-full bg-up/15 px-2 py-0.5 text-sm font-medium text-up tabular-nums">
        +18%
      </span>
    </div>
    <Sparkline
      values={VISITORS}
      label="Visitors over the last 14 days"
      className="h-16"
    />
    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {countries.map((c) => (
        <li key={c.code} className="flex items-center gap-2">
          <DimensionIcon kind="country" value={c.code} className="size-4" />
          <span className="flex-1 truncate">{c.name}</span>
          <span className="text-muted-foreground tabular-nums">
            {Math.round(c.share * 100)}%
          </span>
        </li>
      ))}
    </ul>
  </figure>
)
