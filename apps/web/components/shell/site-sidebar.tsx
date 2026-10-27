"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import type { UserMenuType } from "@/components/app/user-menu"
import { useAnalyticsNav } from "@/components/dashboard/nav-context"
import { isActive, NAV } from "./nav"
import { SidebarUser } from "./sidebar-user"
import { SiteMenu, type SwitcherSite } from "./site-menu"
import { ThemeToggle } from "./theme-toggle"

type SiteSidebarType = { sites: SwitcherSite[]; user: UserMenuType }

const ITEM =
  "h-10 gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 transition-[background-color,color,box-shadow] group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2.5! hover:bg-sidebar-foreground/[0.06] hover:text-sidebar-foreground data-active:bg-background data-active:font-medium data-active:text-foreground data-active:shadow-[0_1px_2px_oklch(0_0_0/0.08),0_0_0_1px_var(--border)] data-active:hover:bg-background [&_svg]:size-[18px] [&_svg]:text-sidebar-foreground/60 data-active:[&_svg]:text-primary"

export const SiteSidebar = ({ sites, user }: SiteSidebarType) => {
  const pathname = usePathname()
  const { siteId, hrefWith } = useAnalyticsNav()
  const root = `/sites/${siteId}`

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-2 pb-1">
        <SiteMenu sites={sites} />
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="h-7 px-3 text-xs font-medium text-sidebar-foreground/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const href = `${root}${item.path}`
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={isActive(pathname, href, item.exact)}
                        tooltip={item.label}
                        className={ITEM}
                        render={
                          <Link href={item.keep ? hrefWith({}, href) : href} />
                        }
                      >
                        <Icon aria-hidden />
                        <span className="flex-1">{item.label}</span>
                        {item.label === "Realtime" && (
                          <span
                            aria-hidden
                            className="relative flex size-2 group-data-[collapsible=icon]:hidden"
                          >
                            <span className="absolute inset-0 animate-ping rounded-full bg-up/60 motion-reduce:hidden" />
                            <span className="relative size-2 rounded-full bg-up" />
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-1 p-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
            <SidebarMenuButton
              tooltip="API docs"
              className={ITEM}
              render={<Link href="/docs/api" />}
            >
              <BookOpen aria-hidden />
              <span>API docs</span>
            </SidebarMenuButton>
            <ThemeToggle className="shrink-0" />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarUser {...user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
