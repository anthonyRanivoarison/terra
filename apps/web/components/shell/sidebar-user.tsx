"use client"

import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useSidebar } from "@workspace/ui/components/sidebar"
import {
  UserAvatar,
  UserMenuItems,
  userLabel,
  type UserMenuType,
} from "@/components/app/user-menu"

export const SidebarUser = (user: UserMenuType) => {
  const { isMobile } = useSidebar()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/row flex h-10 w-full min-w-0 items-center gap-2 rounded-full border border-sidebar-border bg-sidebar pr-1.5 pl-2 text-left text-sidebar-foreground transition-colors outline-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent">
        <UserAvatar {...user} className="size-6" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
          {userLabel(user)}
        </span>
        <span className="grid size-7 shrink-0 place-content-center rounded-full text-sidebar-foreground/70 group-hover/row:text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          <MoreHorizontal className="size-4" aria-hidden />
        </span>
        <span className="sr-only">Open account menu</span>
      </DropdownMenuTrigger>
      <UserMenuItems
        {...user}
        align="end"
        side={isMobile ? "bottom" : "right"}
      />
    </DropdownMenu>
  )
}
