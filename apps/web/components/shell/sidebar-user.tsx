"use client"

import { ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  UserAvatar,
  UserMenuItems,
  userLabel,
  type UserMenuType,
} from "@/components/app/user-menu"

export const SidebarUser = (user: UserMenuType) => {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 gap-3 rounded-xl px-2.5 hover:bg-sidebar-foreground/[0.06] data-popup-open:bg-background"
              />
            }
          >
            <UserAvatar {...user} className="size-8" />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate font-medium">{userLabel(user)}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronsUpDown
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <UserMenuItems
            {...user}
            align="end"
            side={isMobile ? "bottom" : "right"}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
