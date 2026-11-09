import { Eye, MousePointerClick, ShoppingBag, Undo2 } from "lucide-react"
import type { TimelineItem } from "@/lib/analytics/sessions"
import { formatDuration, formatMoney } from "../format"

const ICONS = {
  view: Eye,
  event: MousePointerClick,
  purchase: ShoppingBag,
  refund: Undo2,
}

function props(detail: string | null): string | null {
  if (!detail) return null
  try {
    return Object.entries(JSON.parse(detail) as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ")
  } catch {
    return detail
  }
}

type VisitTimelineType = { items: TimelineItem[]; currency: string }

export const VisitTimeline = ({ items, currency }: VisitTimelineType) => (
  <ol className="relative flex flex-col gap-4 border-l pl-6">
    {items.map((item, i) => {
      const special = item.label === "purchase" || item.label === "refund"
      const Icon = special
        ? ICONS[item.label as "purchase" | "refund"]
        : ICONS[item.kind]
      const detail = item.kind === "view" ? item.detail : props(item.detail)
      return (
        <li
          key={`${item.at}-${i}`}
          className="relative flex flex-col gap-0.5 text-sm"
        >
          <span className="absolute top-0.5 -left-[2.06rem] flex size-6 items-center justify-center rounded-full border bg-background">
            <Icon className="size-3.5 text-muted-foreground" aria-hidden />
          </span>
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span
              className={
                item.kind === "event" ? "font-mono text-[13px]" : "font-medium"
              }
            >
              {item.label}
            </span>
            <time className="text-xs text-muted-foreground tabular-nums">
              {new Date(item.at).toLocaleTimeString("en-GB")}
            </time>
          </span>
          {detail && <span className="text-muted-foreground">{detail}</span>}
          {item.kind === "view" && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(item.durationS)} on page
              {item.scrollPct !== null ? ` · scrolled ${item.scrollPct}%` : ""}
            </span>
          )}
          {item.amountCents !== null && (
            <span className="text-xs font-medium text-up">
              {formatMoney(item.amountCents, currency)}
            </span>
          )}
        </li>
      )
    })}
  </ol>
)
