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
          ? "border-up/30 bg-up/10 text-up"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      )}
    >
      <Icon aria-hidden />
      {formatPercent(share)} verified
    </Badge>
  )
}
