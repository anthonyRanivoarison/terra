import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type DeltaType = { current: number; previous: number; invert?: boolean }

export const Delta = ({ current, previous, invert = false }: DeltaType) => {
  if (previous === 0) {
    return (
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        {current > 0 ? "New" : "—"}
      </span>
    )
  }
  const change = Math.round(((current - previous) / previous) * 100)
  const good = invert ? change < 0 : change > 0
  const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        change === 0 && "bg-muted text-muted-foreground",
        change !== 0 && good && "bg-emerald-500/10 text-emerald-700",
        change !== 0 && !good && "bg-red-500/10 text-red-700"
      )}
    >
      {change !== 0 && <Icon className="size-3" strokeWidth={2} aria-hidden />}
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  )
}
