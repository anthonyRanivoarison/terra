"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronsUpDown, LayoutGrid, Plus, Settings } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SiteFavicon } from "@/components/sites/site-favicon"
import { useSiteNav } from "./use-site-nav"

export type SwitcherSite = { publicId: string; name: string; domain: string }

type SiteMenuType = { sites: SwitcherSite[]; readOnly?: boolean }

export const SiteMenu = ({ sites, readOnly = false }: SiteMenuType) => {
  const pathname = usePathname()
  const { siteId, root } = useSiteNav()
  const view = siteId
    ? pathname.slice(root.length).split("/").slice(0, 3).join("/")
    : "/dashboard"
  const current = sites.find((s) => s.publicId === siteId)

  return (
    <ButtonGroup className="w-full group-data-[collapsible=icon]:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-9 min-w-0 flex-1 justify-start gap-2 px-2 font-semibold"
            />
          }
        >
          {current ? (
            <SiteFavicon
              siteId={current.publicId}
              domain={current.domain}
              className="size-5 rounded-md"
            />
          ) : (
            <LayoutGrid className="size-4 text-muted-foreground" aria-hidden />
          )}
          <span className="min-w-0 flex-1 truncate text-left">
            {current?.name ?? "All sites"}
          </span>
          <ChevronsUpDown
            className="size-4 text-muted-foreground"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Sites
            </DropdownMenuLabel>
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
          </DropdownMenuGroup>
          {!readOnly && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/sites" />}>
                <LayoutGrid aria-hidden />
                All sites
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/sites/new" />}>
                <Plus aria-hidden />
                Add a site
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {!readOnly && (
        <Button
          variant="outline"
          size="icon"
          aria-label={siteId ? "Site settings" : "Settings"}
          className="size-9"
          nativeButton={false}
          render={<Link href={siteId ? root : "/settings/api-keys"} />}
        >
          <Settings aria-hidden />
        </Button>
      )}
    </ButtonGroup>
  )
}
