import {
  RobotIcon,
  CurrencyCircleDollarIcon,
  CodeIcon,
  FileTextIcon,
  FileArrowUpIcon,
  GaugeIcon,
  SquaresFourIcon,
  GridFourIcon,
  PlusIcon,
  PlugIcon,
  BroadcastIcon,
  RewindIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"

export type NavItem = {
  label: string
  path: string
  icon: Icon
  keep: boolean
  exact?: boolean
  live?: boolean
  children?: NavItem[]
}

export type NavGroup = { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    label: "Menu",
    items: [
      {
        label: "Overview",
        path: "/dashboard",
        icon: SquaresFourIcon,
        keep: true,
        exact: true,
      },
      {
        label: "Pages",
        path: "/dashboard/pages",
        icon: FileTextIcon,
        keep: true,
      },
      {
        label: "Realtime",
        path: "/dashboard/realtime",
        icon: BroadcastIcon,
        keep: true,
        live: true,
        children: [
          {
            label: "Sessions",
            path: "/dashboard/sessions",
            icon: RewindIcon,
            keep: true,
          },
        ],
      },
      {
        label: "Revenue",
        path: "/dashboard/revenue",
        icon: CurrencyCircleDollarIcon,
        keep: true,
        children: [
          {
            label: "Payments",
            path: "/settings/revenue",
            icon: PlugIcon,
            keep: false,
          },
        ],
      },
      {
        label: "Performance",
        path: "/dashboard/performance",
        icon: GaugeIcon,
        keep: true,
      },
      {
        label: "AI & bots",
        path: "/dashboard/bots",
        icon: RobotIcon,
        keep: true,
      },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Tracking", path: "", icon: CodeIcon, keep: false, exact: true },
      {
        label: "Import",
        path: "/settings/import",
        icon: FileArrowUpIcon,
        keep: false,
      },
    ],
  },
]

export const HOME_NAV: NavGroup[] = [
  {
    label: "Sites",
    items: [
      {
        label: "All sites",
        path: "/sites",
        icon: GridFourIcon,
        keep: false,
        exact: true,
      },
      { label: "Add a site", path: "/sites/new", icon: PlusIcon, keep: false },
    ],
  },
]

export const readOnlyNav = (groups: NavGroup[]): NavGroup[] =>
  groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => item.keep)
        .map(({ children, ...item }) => {
          const kept = children?.filter((child) => child.keep)
          return kept?.length ? { ...item, children: kept } : item
        }),
    }))
    .filter((group) => group.items.length > 0)

export const flatNav = (groups: NavGroup[]) =>
  groups.flatMap((g) => g.items.flatMap((i) => [i, ...(i.children ?? [])]))

export const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname.startsWith(href)
