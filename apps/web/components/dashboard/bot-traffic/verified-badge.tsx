import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { formatPercent } from "../format"

type VerifiedBadgeType = { share: number | null; compact?: boolean }

export const VerifiedBadge = ({ share, compact }: VerifiedBadgeType) => {
  if (share === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <ShieldQuestion aria-hidden />
        {compact ? "Unchecked" : "No published IP list"}
      </Badge>
    )
  }
  const good = share >= 0.9
  const Icon = good ? ShieldCheck : ShieldAlert
  return (
    <Badge
      variant="outline"
      className={cn(
        good
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700"
      )}
    >
      <Icon aria-hidden />
      {formatPercent(share)} verified
    </Badge>
  )
}
