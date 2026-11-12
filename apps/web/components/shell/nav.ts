import {
  CodeIcon,
  FileArrowUpIcon,
  GaugeIcon,
  GridFourIcon,
  PlugIcon,
  PlusIcon,
  RewindIcon,
  RobotIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"

export type NavItem = {
  label: string
  path: string
  icon: Icon
  keep: boolean
  exact?: boolean
}

export const NAV: NavItem[] = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: SquaresFourIcon,
    keep: true,
    exact: true,
  },
  {
    label: "Sessions",
    path: "/dashboard/sessions",
    icon: RewindIcon,
    keep: true,
  },
  { label: "AI & bots", path: "/dashboard/bots", icon: RobotIcon, keep: true },
  {
    label: "Performance",
    path: "/dashboard/performance",
    icon: GaugeIcon,
    keep: true,
  },
]

export const SETTINGS_NAV: NavItem[] = [
  { label: "Tracking", path: "", icon: CodeIcon, keep: false, exact: true },
  {
    label: "Import",
    path: "/settings/import",
    icon: FileArrowUpIcon,
    keep: false,
  },
  {
    label: "Payments",
    path: "/settings/revenue",
    icon: PlugIcon,
    keep: false,
  },
]

export const HOME_NAV: NavItem[] = [
  {
    label: "All sites",
    path: "/sites",
    icon: GridFourIcon,
    keep: false,
    exact: true,
  },
  { label: "Add a site", path: "/sites/new", icon: PlusIcon, keep: false },
]

export const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname.startsWith(href)
