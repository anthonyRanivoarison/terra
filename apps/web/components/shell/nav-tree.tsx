"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { HOME_NAV, isActive, NAV, type NavItem } from "./nav"
import { useSiteNav } from "./use-site-nav"

export const ITEM =
  "h-8 gap-2.5 rounded-md px-2 text-[0.875rem] text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-foreground [&_svg]:size-4"

const SUB =
  "h-8 gap-2.5 rounded-md px-2 text-[0.875rem] text-sidebar-foreground/85 hover:bg-sidebar-accent data-active:bg-sidebar-accent data-active:font-medium [&>svg]:size-4 [&>svg]:text-sidebar-foreground/80"

const LiveDot = () => (
  <span
    aria-hidden
    className="relative ms-auto flex size-2 group-data-[collapsible=icon]:hidden"
  >
    <span className="absolute inset-0 animate-ping rounded-full bg-up/60 motion-reduce:hidden" />
    <span className="relative size-2 rounded-full bg-up" />
  </span>
)

export const NavTree = () => {
  const pathname = usePathname()
  const { siteId, root, keep } = useSiteNav()
  const groups = siteId ? NAV : HOME_NAV
  const link = (item: NavItem) => {
    const href = `${root}${item.path}`
    return {
      href: item.keep ? keep(href) : href,
      active: isActive(pathname, href, item.exact),
    }
  }

  return groups.map((group) => (
    <SidebarGroup key={group.label} className="py-1">
      <SidebarGroupLabel className="h-7 px-2 text-xs font-medium text-sidebar-foreground/60">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {group.items.map((item) => {
            const self = link(item)
            const Icon = item.icon
            return (
              <Collapsible
                key={item.label}
                defaultOpen
                render={<SidebarMenuItem />}
              >
                <SidebarMenuButton
                  isActive={self.active}
                  tooltip={item.label}
                  className={cn(ITEM, item.children && "pe-9")}
                  render={<Link href={self.href} />}
                >
                  <Icon aria-hidden />
                  <span>{item.label}</span>
                  {item.live && <LiveDot />}
                </SidebarMenuButton>
                {item.children && (
                  <>
                    <CollapsibleTrigger
                      aria-label={`Toggle ${item.label}`}
                      className="group/chev absolute top-1 right-1 flex size-6 items-center justify-center rounded-md text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                      <ChevronRight className="size-4 transition-transform duration-200 group-data-panel-open/chev:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mx-0 ms-[0.95rem] me-0 gap-0.5 border-sidebar-foreground/15 py-0.5 ps-2.5 pe-0">
                        {item.children.map((child) => {
                          const sub = link(child)
                          const ChildIcon = child.icon
                          return (
                            <SidebarMenuSubItem key={child.label}>
                              <SidebarMenuSubButton
                                isActive={sub.active}
                                className={SUB}
                                render={<Link href={sub.href} />}
                              >
                                <ChildIcon aria-hidden />
                                <span>{child.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ))
}
