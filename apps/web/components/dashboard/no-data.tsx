import type { LucideIcon } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { cn } from "@workspace/ui/lib/utils"

type NoDataType = {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export const NoData = ({
  icon: Icon,
  title,
  description,
  className,
}: NoDataType) => (
  <Empty className={cn("min-h-40 border", className)}>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon aria-hidden />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
    </EmptyHeader>
  </Empty>
)
