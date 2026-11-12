import {
  BookOpenIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"
import { HOME_NAV, NAV, SETTINGS_NAV } from "./nav"
import type { SwitcherSite } from "./site-menu"

export type SearchItem = {
  key: string
  label: string
  hint?: string
  icon: Icon
  href?: string
  theme?: "light" | "dark"
}

export type SearchGroup = { label: string; items: SearchItem[] }

type BuildType = {
  siteId: string | null
  root: string
  keep: (href: string) => string
  sites: SwitcherSite[]
}

export const buildGroups = ({ siteId, root, keep, sites }: BuildType) => {
  const pages = (siteId ? [...NAV, ...SETTINGS_NAV] : []).map((item) => ({
    key: `page:${item.label}`,
    label: item.label,
    icon: item.icon,
    href: item.keep ? keep(`${root}${item.path}`) : `${root}${item.path}`,
  }))
  const home = HOME_NAV.map((item) => ({
    key: `home:${item.label}`,
    label: item.label,
    icon: item.icon,
    href: item.path,
  }))
  const groups: SearchGroup[] = [
    { label: "Go to", items: [...pages, ...home] },
    {
      label: "Sites",
      items: sites.map((site) => ({
        key: `site:${site.publicId}`,
        label: site.name,
        hint: site.domain,
        icon: GlobeIcon,
        href: `/sites/${site.publicId}/dashboard`,
      })),
    },
    {
      label: "Appearance",
      items: [
        {
          key: "theme:light",
          label: "Light theme",
          icon: SunIcon,
          theme: "light",
        },
        {
          key: "theme:dark",
          label: "Dark theme",
          icon: MoonIcon,
          theme: "dark",
        },
      ],
    },
    {
      label: "Help",
      items: [
        {
          key: "docs",
          label: "API docs",
          icon: BookOpenIcon,
          href: "/docs/api",
        },
      ],
    },
  ]
  return groups
}

export const filterGroups = (groups: SearchGroup[], query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return groups
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) =>
        `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(needle)
      ),
    }))
    .filter((g) => g.items.length > 0)
}
