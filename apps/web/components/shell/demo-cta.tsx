import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export const DemoCta = () => (
  <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
    <p className="text-sm font-medium">Live demo</p>
    <p className="text-xs text-pretty text-sidebar-foreground/70">
      Sample data from a fictional store. Add your own site in a minute.
    </p>
    <Link
      href="/auth/signup"
      className={cn(buttonVariants({ size: "sm" }), "mt-1 w-full")}
    >
      Create a free account
      <ArrowRight data-icon="inline-end" />
    </Link>
  </div>
)
