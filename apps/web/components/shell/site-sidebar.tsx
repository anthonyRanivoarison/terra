"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import type { UserMenuType } from "@/components/app/user-menu"
import { NavTree } from "./nav-tree"
import { SearchCommand } from "./search-command"
import { InformationCard } from "./information-card"
import { SidebarUser } from "./sidebar-user"
import { SiteMenu, type SwitcherSite } from "./site-menu"

type SiteSidebarType = { sites: SwitcherSite[]; user: UserMenuType }

export const SiteSidebar = ({ sites, user }: SiteSidebarType) => (
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader className="gap-2.5 p-2.5 pb-3">
      <SiteMenu sites={sites} />
      <SearchCommand sites={sites} />
    </SidebarHeader>
    <div className="mx-2.5 border-t group-data-[collapsible=icon]:hidden" />
    <SidebarContent className="gap-0 overflow-x-hidden px-0.5 pt-2">
      <NavTree />
    </SidebarContent>
    <SidebarFooter className="gap-3 p-3 pt-0">
      <InformationCard />
      <SidebarUser {...user} />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
)
