"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { isActive, NAV } from "./nav"
import { useSiteNav } from "./use-site-nav"

type HeaderNavType = { className?: string }

export const HeaderNav = ({ className }: HeaderNavType) => {
  const pathname = usePathname()
  const { siteId, root, keep } = useSiteNav()
  if (!siteId) return null

  return (
    <nav
      aria-label="Dashboard"
      className={cn(
        "flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {NAV.map((item) => {
        const href = `${root}${item.path}`
        const active = isActive(pathname, href, item.exact)
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={keep(href)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              active && "bg-muted text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
