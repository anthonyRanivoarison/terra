import {
  Bot,
  CircleDollarSign,
  Code,
  FileText,
  FileUp,
  Gauge,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Plug,
  Radio,
  Rewind,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
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
        icon: LayoutDashboard,
        keep: true,
        exact: true,
      },
      {
        label: "Pages",
        path: "/dashboard/pages",
        icon: FileText,
        keep: true,
      },
      {
        label: "Realtime",
        path: "/dashboard/realtime",
        icon: Radio,
        keep: true,
        live: true,
        children: [
          {
            label: "Sessions",
            path: "/dashboard/sessions",
            icon: Rewind,
            keep: true,
          },
        ],
      },
      {
        label: "Revenue",
        path: "/dashboard/revenue",
        icon: CircleDollarSign,
        keep: true,
        children: [
          {
            label: "Payments",
            path: "/settings/revenue",
            icon: Plug,
            keep: false,
          },
        ],
      },
      {
        label: "Performance",
        path: "/dashboard/performance",
        icon: Gauge,
        keep: true,
      },
      { label: "AI & bots", path: "/dashboard/bots", icon: Bot, keep: true },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Tracking", path: "", icon: Code, keep: false, exact: true },
      {
        label: "Import",
        path: "/settings/import",
        icon: FileUp,
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
        icon: LayoutGrid,
        keep: false,
        exact: true,
      },
      { label: "Add a site", path: "/sites/new", icon: Plus, keep: false },
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
