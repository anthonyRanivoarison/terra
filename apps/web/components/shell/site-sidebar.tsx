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

export const SiteSidebar = ({ sites, user }: SiteSidebarType) => {
  const pathname = usePathname()
  const { siteId, hrefWith } = useAnalyticsNav()
  const root = `/sites/${siteId}`

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <SiteMenu sites={sites} />
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const href = `${root}${item.path}`
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={isActive(pathname, href, item.exact)}
                        tooltip={item.label}
                        render={
                          <Link href={item.keep ? hrefWith({}, href) : href} />
                        }
                      >
                        <Icon aria-hidden />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-1 border-t">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
            <SidebarMenuButton
              tooltip="API docs"
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
