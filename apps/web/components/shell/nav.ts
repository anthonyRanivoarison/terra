import {
  Bot,
  CircleDollarSign,
  Code,
  FileText,
  Gauge,
  LayoutDashboard,
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
}

export type NavGroup = { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    label: "Analytics",
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
      },
      {
        label: "Revenue",
        path: "/dashboard/revenue",
        icon: CircleDollarSign,
        keep: true,
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
    label: "Behavior",
    items: [
      {
        label: "Sessions",
        path: "/dashboard/sessions",
        icon: Rewind,
        keep: true,
      },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Tracking", path: "", icon: Code, keep: false, exact: true },
      {
        label: "Payments",
        path: "/settings/revenue",
        icon: Plug,
        keep: false,
      },
    ],
  },
]

export const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname.startsWith(href)
