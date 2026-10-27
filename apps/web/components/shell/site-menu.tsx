"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronsUpDown, LayoutGrid, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { SiteFavicon } from "@/components/sites/site-favicon"
import { useAnalyticsNav } from "@/components/dashboard/nav-context"

export type SwitcherSite = { publicId: string; name: string; domain: string }

type SiteMenuType = { sites: SwitcherSite[] }

export const SiteMenu = ({ sites }: SiteMenuType) => {
  const pathname = usePathname()
  const { siteId } = useAnalyticsNav()
  const root = `/sites/${siteId}`
  const view = pathname.slice(root.length).split("/").slice(0, 3).join("/")
  const current = sites.find((s) => s.publicId === siteId)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-14 gap-3 rounded-xl px-2.5 hover:bg-sidebar-foreground/[0.06] data-popup-open:bg-background data-popup-open:shadow-[0_0_0_1px_var(--border)]"
              />
            }
          >
            {current && (
              <SiteFavicon
                siteId={current.publicId}
                domain={current.domain}
                className="size-9 rounded-lg bg-background p-1.5 shadow-[0_0_0_1px_var(--border)]"
              />
            )}
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-[0.95rem] font-semibold">
                {current?.name ?? "Select a site"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {current?.domain}
              </span>
            </span>
            <ChevronsUpDown
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            {sites.map((site) => (
              <DropdownMenuItem
                key={site.publicId}
                render={<Link href={`/sites/${site.publicId}${view}`} />}
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
                  <Check className="size-4" aria-hidden />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/sites" />}>
              <LayoutGrid aria-hidden />
              All sites
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/sites/new" />}>
              <Plus aria-hidden />
              Add a site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
