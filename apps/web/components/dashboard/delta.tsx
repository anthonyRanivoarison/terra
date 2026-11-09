import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type DeltaType = { current: number; previous: number; invert?: boolean }

export const Delta = ({ current, previous, invert = false }: DeltaType) => {
  if (previous === 0) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {current > 0 ? "New" : "—"}
      </span>
    )
  }
  const change = ((current - previous) / previous) * 100
  const good = invert ? change < 0 : change > 0
  const Icon = change >= 0 ? ArrowUp : ArrowDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        Math.abs(change) < 0.05 && "text-muted-foreground",
        Math.abs(change) >= 0.05 && (good ? "text-up" : "text-down")
      )}
    >
      {Math.abs(change) >= 0.05 && (
        <Icon className="size-3" strokeWidth={2.5} aria-hidden />
      )}
      <span className="sr-only">{change >= 0 ? "Up" : "Down"}</span>
      {Math.abs(change).toFixed(1)}%
    </span>
  )
}
