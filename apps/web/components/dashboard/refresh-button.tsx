"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RotateCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type RefreshButtonType = { action: () => Promise<void> }

export const RefreshButton = ({ action }: RefreshButtonType) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={() =>
        startTransition(async () => {
          await action()
          router.refresh()
        })
      }
      disabled={isPending}
      aria-label={isPending ? "Refreshing data" : "Refresh data"}
      aria-busy={isPending}
    >
      <RotateCw
        className={cn("size-4", isPending && "animate-spin")}
        strokeWidth={2}
        aria-hidden="true"
      />
    </Button>
  )
}
