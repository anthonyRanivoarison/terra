"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CheckIcon,
  CaretUpDownIcon,
  GridFourIcon,
  PlusIcon,
} from "@phosphor-icons/react/ssr"
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
import { SettingsMenu } from "./settings-menu"
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
    <ButtonGroup className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-8 max-w-52 min-w-0 justify-start gap-2 px-2 font-semibold"
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
            <GridFourIcon
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          )}
          <span className="min-w-0 flex-1 truncate text-left">
            {current?.name ?? "All sites"}
          </span>
          <CaretUpDownIcon
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
                  <CheckIcon className="size-4" aria-hidden />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {!readOnly && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/sites" />}>
                <GridFourIcon aria-hidden />
                All sites
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/sites/new" />}>
                <PlusIcon aria-hidden />
                Add a site
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {!readOnly && <SettingsMenu />}
    </ButtonGroup>
  )
}
