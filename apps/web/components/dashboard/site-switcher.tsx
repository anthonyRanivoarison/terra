"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SiteFavicon } from "@/components/sites/site-favicon"
import { useAnalyticsNav } from "./nav-context"

export type SwitcherSite = { publicId: string; name: string; domain: string }

type SiteSwitcherType = { sites: SwitcherSite[] }

const VIEWS = ["/realtime", "/sessions"]

export const SiteSwitcher = ({ sites }: SiteSwitcherType) => {
  const pathname = usePathname()
  const { siteId, base } = useAnalyticsNav()
  const current = sites.find((s) => s.publicId === siteId)
  const rest = pathname.slice(base.length)
  const view = VIEWS.find((v) => rest.startsWith(v)) ?? ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="-ml-2 h-auto gap-2 px-2 py-1 font-heading text-2xl font-semibold tracking-tight"
          />
        }
      >
        {current && (
          <SiteFavicon
            siteId={current.publicId}
            domain={current.domain}
            className="size-5 rounded"
          />
        )}
        <span className="truncate">{current?.name ?? "Select a site"}</span>
        <ChevronsUpDown
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {sites.map((site) => (
          <DropdownMenuItem
            key={site.publicId}
            render={<Link href={`/sites/${site.publicId}/dashboard${view}`} />}
            className="flex items-center gap-2"
          >
            <SiteFavicon siteId={site.publicId} domain={site.domain} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{site.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {site.domain}
              </span>
            </span>
            {site.publicId === siteId && (
              <Check className="size-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/sites" />}>
          All sites
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/sites/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          Add a site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
