import {
  DEMO_CHANNELS,
  formatMoney,
  formatRate,
} from "@/components/landing/demo-data"
import { RowIcon } from "./row-icon"

const ranked = [...DEMO_CHANNELS].sort((a, b) => b.revenue - a.revenue)
const top = ranked[0]!.revenue

export const RevenueVisual = () => (
  <figure>
    <figcaption className="flex justify-between text-sm text-muted-foreground">
      <span>Revenue by channel</span>
      <span>Per visitor</span>
    </figcaption>
    <ul className="mt-3 flex flex-col gap-3">
      {ranked.slice(0, 4).map((c) => (
        <li key={c.name} className="grid gap-1.5">
          <div className="flex items-center gap-2.5 text-sm">
            <RowIcon channel={c.name} />
            <span className="flex-1">{c.name}</span>
            <span className="w-14 text-right text-muted-foreground tabular-nums">
              {formatRate(c.revenue / c.visitors)}
            </span>
            <span className="w-20 text-right font-medium text-(--marketing-gold) tabular-nums">
              {formatMoney(c.revenue)}
            </span>
          </div>
          <span aria-hidden className="ml-8 h-1 rounded-full bg-foreground/10">
            <span
              data-bar
              className="block h-full origin-left rounded-full bg-(--marketing-gold)"
              style={{ transform: `scaleX(${c.revenue / top})` }}
            />
          </span>
        </li>
      ))}
    </ul>
  </figure>
)
