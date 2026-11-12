import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { Cta } from "@/components/marketing/cta"

type DemoCtaType = { cta: Cta }

export const DemoCta = ({ cta }: DemoCtaType) => (
  <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
    <p className="text-sm font-medium">Live demo</p>
    <p className="text-xs text-pretty text-sidebar-foreground/70">
      Sample data from fictional sites. Run Terra on your own sites in a minute.
    </p>
    <Link
      href={cta.href}
      className={cn(buttonVariants({ size: "sm" }), "mt-1 w-full")}
    >
      {cta.label}
      <ArrowRightIcon data-icon="inline-end" />
    </Link>
  </div>
)
