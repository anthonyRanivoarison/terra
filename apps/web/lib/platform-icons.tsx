import Android from "@thesvg/react/android"
import Apple from "@thesvg/react/apple"
import Arc from "@thesvg/react/arc"
import ArchLinux from "@thesvg/react/archlinux"
import Brave from "@thesvg/react/brave"
import Chrome from "@thesvg/react/chrome"
import Debian from "@thesvg/react/debian"
import Duckduckgo from "@thesvg/react/duckduckgo"
import Edge from "@thesvg/react/edge"
import Fedora from "@thesvg/react/fedora"
import Firefox from "@thesvg/react/firefox"
import Helium from "@thesvg/react/helium"
import Linux from "@thesvg/react/linux"
import Opera from "@thesvg/react/opera"
import Safari from "@thesvg/react/safari"
import Samsung from "@thesvg/react/samsung"
import Tor from "@thesvg/react/tor"
import Ubuntu from "@thesvg/react/ubuntu"
import Vivaldi from "@thesvg/react/vivaldi"
import Windows from "@thesvg/react/windows"
import Yandex from "@thesvg/react/yandex"
import Bing from "@thesvg/react/bing"
import Bluesky from "@thesvg/react/bluesky"
import Claude from "@thesvg/react/claude"
import Devto from "@thesvg/react/devto"
import Discord from "@thesvg/react/discord"
import Ecosia from "@thesvg/react/ecosia"
import Facebook from "@thesvg/react/facebook"
import Github from "@thesvg/react/github"
import Gitlab from "@thesvg/react/gitlab"
import Google from "@thesvg/react/google"
import Hashnode from "@thesvg/react/hashnode"
import Instagram from "@thesvg/react/instagram"
import Kagi from "@thesvg/react/kagi"
import Linkedin from "@thesvg/react/linkedin"
import Medium from "@thesvg/react/medium"
import Openai from "@thesvg/react/openai"
import Perplexity from "@thesvg/react/perplexity"
import ProductHunt from "@thesvg/react/product-hunt"
import Reddit from "@thesvg/react/reddit"
import Slack from "@thesvg/react/slack"
import StackOverflow from "@thesvg/react/stack-overflow"
import Telegram from "@thesvg/react/telegram"
import Threads from "@thesvg/react/threads"
import Vercel from "@thesvg/react/vercel"
import Whatsapp from "@thesvg/react/whatsapp"
import X from "@thesvg/react/x"
import YCombinator from "@thesvg/react/y-combinator"
import Youtube from "@thesvg/react/youtube"
import {
  RobotIcon,
  QuestionIcon,
  GlobeIcon,
  CursorClickIcon,
  LaptopIcon,
  MonitorIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"
import type { ComponentType, ReactNode, SVGProps } from "react"
import { renderBrandIcon as render } from "./brand-icon"

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const WHOLE_WORD = new Set(["arc", "tor", "ios"])

const BROWSER_MATCHERS: [string, IconComponent][] = [
  ["helium", Helium],
  ["edge", Edge],
  ["opera", Opera],
  ["brave", Brave],
  ["vivaldi", Vivaldi],
  ["samsung", Samsung],
  ["yandex", Yandex],
  ["duckduckgo", Duckduckgo],
  ["arc", Arc],
  ["tor", Tor],
  ["firefox", Firefox],
  ["safari", Safari],
  ["chrom", Chrome],
]

const OS_MATCHERS: [string, IconComponent][] = [
  ["windows", Windows],
  ["mac", Apple],
  ["ios", Apple],
  ["ipados", Apple],
  ["android", Android],
  ["ubuntu", Ubuntu],
  ["fedora", Fedora],
  ["debian", Debian],
  ["arch", ArchLinux],
  ["chrome", Chrome],
  ["linux", Linux],
]

const DEVICE_ICONS: Record<string, Icon> = {
  desktop: MonitorIcon,
  mobile: DeviceMobileIcon,
  tablet: DeviceTabletIcon,
  bot: RobotIcon,
}

function match(
  name: string,
  matchers: [string, IconComponent][]
): IconComponent | null {
  const key = name.toLowerCase()
  for (const [needle, Icon] of matchers) {
    const hit = WHOLE_WORD.has(needle)
      ? new RegExp(`\\b${needle}\\b`).test(key)
      : key.includes(needle)
    if (hit) return Icon
  }
  return null
}

export const getBrowserIcon = (
  browser: string,
  className = "size-3.5"
): ReactNode => {
  return render(match(browser, BROWSER_MATCHERS) ?? QuestionIcon, className)
}

export const getOSIcon = (os: string, className = "size-3.5"): ReactNode => {
  return render(match(os, OS_MATCHERS) ?? LaptopIcon, className)
}

export const getDeviceIcon = (
  device: string,
  className = "size-3.5"
): ReactNode => {
  const Icon = DEVICE_ICONS[device.toLowerCase()] ?? MonitorIcon
  return <Icon className={className} aria-hidden="true" />
}

const REFERRER_MATCHERS: [RegExp, IconComponent][] = [
  [/(^|\.)github\.com$/, Github],
  [/(^|\.)gitlab\.com$/, Gitlab],
  [/(^|\.)google\./, Google],
  [/(^|\.)bing\.com$/, Bing],
  [/(^|\.)duckduckgo\.com$/, Duckduckgo],
  [/(^|\.)kagi\.com$/, Kagi],
  [/(^|\.)ecosia\.org$/, Ecosia],
  [/(^|\.)yandex\./, Yandex],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, X],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, Linkedin],
  [/(^|\.)reddit\.com$/, Reddit],
  [/(^|\.)news\.ycombinator\.com$/, YCombinator],
  [/(^|\.)(youtube\.com|youtu\.be)$/, Youtube],
  [/(^|\.)facebook\.com$/, Facebook],
  [/(^|\.)instagram\.com$/, Instagram],
  [/(^|\.)threads\.(net|com)$/, Threads],
  [/(^|\.)bsky\.app$/, Bluesky],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, Openai],
  [/(^|\.)perplexity\.ai$/, Perplexity],
  [/(^|\.)claude\.ai$/, Claude],
  [/(^|\.)dev\.to$/, Devto],
  [/(^|\.)hashnode\.(com|dev)$/, Hashnode],
  [/(^|\.)medium\.com$/, Medium],
  [/(^|\.)stackoverflow\.com$/, StackOverflow],
  [/(^|\.)producthunt\.com$/, ProductHunt],
  [/(^|\.)(discord\.com|discord\.gg)$/, Discord],
  [/(^|\.)slack\.com$/, Slack],
  [/(^|\.)(t\.me|telegram\.org)$/, Telegram],
  [/(^|\.)whatsapp\.com$/, Whatsapp],
  [/(^|\.)vercel\.(com|app)$/, Vercel],
]

export const getReferrerIcon = (
  hostname: string,
  className = "size-3.5"
): ReactNode => {
  if (hostname === "Direct") {
    return <CursorClickIcon className={className} aria-hidden="true" />
  }
  const host = hostname.toLowerCase().replace(/^www\./, "")
  return render(
    REFERRER_MATCHERS.find(([re]) => re.test(host))?.[1] ?? GlobeIcon,
    className
  )
}
