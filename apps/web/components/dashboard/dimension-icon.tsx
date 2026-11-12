"use client"

import { Icon as Iconify } from "@iconify/react"
import {
  CurrencyDollarSimpleIcon,
  RobotIcon,
  TreeStructureIcon,
  FileTextIcon,
  GlobeIcon,
  HandshakeIcon,
  TranslateIcon,
  LinkSimpleIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  MegaphoneIcon,
  CursorClickIcon,
  RulerIcon,
  MagnifyingGlassIcon,
  ShareNetworkIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import {
  getBrowserIcon,
  getDeviceIcon,
  getOSIcon,
  getReferrerIcon,
} from "@/lib/platform-icons"
import { cn } from "@workspace/ui/lib/utils"

const CHANNELS: Record<string, Icon> = {
  Direct: CursorClickIcon,
  "Organic Search": MagnifyingGlassIcon,
  "Paid Search": CurrencyDollarSimpleIcon,
  "Organic Social": ShareNetworkIcon,
  "Paid Social": MegaphoneIcon,
  Email: EnvelopeSimpleIcon,
  AI: SparkleIcon,
  Affiliate: HandshakeIcon,
  Referral: LinkSimpleIcon,
}

const CHANNEL_TONES: Record<string, string> = {
  Direct: "bg-zinc-500/10 text-zinc-600",
  "Organic Search": "bg-blue-500/10 text-blue-600",
  "Paid Search": "bg-amber-500/10 text-amber-600",
  "Organic Social": "bg-sky-500/10 text-sky-600",
  "Paid Social": "bg-pink-500/10 text-pink-600",
  Email: "bg-orange-500/10 text-orange-600",
  AI: "bg-violet-500/10 text-violet-600",
  Affiliate: "bg-emerald-500/10 text-emerald-600",
  Referral: "bg-teal-500/10 text-teal-600",
}

const SIMPLE: Record<string, Icon> = {
  page: FileTextIcon,
  hostname: GlobeIcon,
  entry: FileTextIcon,
  exit: FileTextIcon,
  utm_medium: MegaphoneIcon,
  utm_campaign: MegaphoneIcon,
  campaign: MegaphoneIcon,
  region: MapPinIcon,
  city: MapPinIcon,
  language: TranslateIcon,
  screen: RulerIcon,
  bot: RobotIcon,
  network: TreeStructureIcon,
}

const tile =
  "flex size-6 shrink-0 items-center justify-center rounded-md bg-background shadow-xs ring-1 ring-border"

const BOTS: [RegExp, string][] = [
  [/google/i, "google.com"],
  [/bing|msn/i, "bing.com"],
  [/gpt|openai|chatgpt|oai-/i, "openai.com"],
  [/claude|anthropic/i, "claude.ai"],
  [/perplexity/i, "perplexity.ai"],
  [/twitter|x\.com/i, "x.com"],
  [/facebook|meta-/i, "facebook.com"],
  [/linkedin/i, "linkedin.com"],
  [/slack/i, "slack.com"],
  [/discord/i, "discord.com"],
  [/telegram/i, "telegram.org"],
  [/whatsapp/i, "whatsapp.com"],
  [/yandex/i, "yandex.ru"],
  [/duckduck/i, "duckduckgo.com"],
  [/vercel/i, "vercel.com"],
  [/github/i, "github.com"],
]

function brand(kind: string, value: string): ReactNode | null {
  const cls = "size-3.5"
  if (kind === "browser") return getBrowserIcon(value, cls)
  if (kind === "os") return getOSIcon(value, cls)
  if (kind === "device") return getDeviceIcon(value, cls)
  if (kind === "referrer") return getReferrerIcon(value || "Direct", cls)
  if (kind === "bot") {
    const host = BOTS.find(([re]) => re.test(value))?.[1]
    return host ? getReferrerIcon(host, cls) : null
  }
  if (kind === "utm_source") {
    return getReferrerIcon(value.includes(".") ? value : `${value}.com`, cls)
  }
  return null
}

type DimensionIconType = { kind: string; value: string; className?: string }

export const DimensionIcon = ({
  kind,
  value,
  className,
}: DimensionIconType) => {
  if (kind === "country") {
    return /^[A-Za-z]{2}$/.test(value) ? (
      <Iconify
        icon={`circle-flags:${value.toLowerCase()}`}
        className={cn("size-5 shrink-0 rounded-full shadow-xs", className)}
        aria-hidden="true"
      />
    ) : (
      <span className={cn(tile, className)}>
        <MapPinIcon className="size-3.5 text-muted-foreground" aria-hidden />
      </span>
    )
  }
  if (kind === "channel") {
    const Icon = CHANNELS[value] ?? LinkSimpleIcon
    return (
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md",
          CHANNEL_TONES[value] ?? CHANNEL_TONES.Referral,
          className
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
    )
  }
  const logo = brand(kind, value)
  if (logo) return <span className={cn(tile, className)}>{logo}</span>
  const Icon = SIMPLE[kind]
  if (!Icon) return null
  return (
    <span className={cn(tile, "text-muted-foreground", className)}>
      <Icon className="size-3.5" aria-hidden />
    </span>
  )
}
