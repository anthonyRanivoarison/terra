"use client"

import Link from "next/link"
import { GearIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SETTINGS_NAV } from "./nav"
import { useSiteNav } from "./use-site-nav"

export const SettingsMenu = () => {
  const { siteId, root } = useSiteNav()

  if (!siteId)
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label="Settings"
        className="size-8"
        nativeButton={false}
        render={<Link href="/settings/api-keys" />}
      >
        <GearIcon aria-hidden />
      </Button>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Site settings"
            className="size-8"
          />
        }
      >
        <GearIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.label}
              render={<Link href={`${root}${item.path}`} />}
            >
              <Icon aria-hidden />
              {item.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
