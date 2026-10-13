"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { useAnalyticsNav } from "./nav-context"

export const AnalyticsTabs = () => {
  const pathname = usePathname()
  const { base, siteId, hrefWith } = useAnalyticsNav()
  const tabs = [
    { href: base, label: "Overview", keep: true },
    { href: `${base}/realtime`, label: "Realtime", keep: true },
    { href: `${base}/sessions`, label: "Sessions", keep: true },
    { href: `/sites/${siteId}`, label: "Install", keep: false },
  ]
  return (
    <nav aria-label="Dashboard" className="-mb-px flex gap-5 text-sm">
      {tabs.map((tab) => {
        const active =
          tab.href === base || !tab.keep
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.keep ? hrefWith({}, tab.href) : tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-0.5 pb-2.5 font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
