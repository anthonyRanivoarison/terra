import Amazon from "@thesvg/react/amazon"
import Anthropic from "@thesvg/react/anthropic"
import Apple from "@thesvg/react/apple"
import Bytedance from "@thesvg/react/bytedance"
import Cohere from "@thesvg/react/cohere"
import Duckduckgo from "@thesvg/react/duckduckgo"
import Gemini from "@thesvg/react/gemini"
import Google from "@thesvg/react/google"
import Meta from "@thesvg/react/meta"
import MicrosoftBing from "@thesvg/react/microsoft-bing"
import Mistral from "@thesvg/react/mistral"
import Openai from "@thesvg/react/openai"
import Perplexity from "@thesvg/react/perplexity"
import Yandex from "@thesvg/react/yandex"
import { RobotIcon } from "@phosphor-icons/react/ssr"
import type { ComponentType, SVGProps } from "react"
import type { CrawlCategory } from "@/lib/analytics/crawls"
import { cn } from "@workspace/ui/lib/utils"

type Logo = ComponentType<SVGProps<SVGSVGElement> & { variant?: string }>

type Meta = { name: string; logo?: Logo; variant?: string }

const OPENAI = { logo: Openai as Logo, variant: "light" }
const ANTHROPIC = { logo: Anthropic as Logo, variant: "mono" }
const GOOGLE = { logo: Google as Logo }

const META: Record<string, Meta> = {
  "chatgpt-user": { name: "ChatGPT", ...OPENAI },
  "oai-searchbot": { name: "ChatGPT Search", ...OPENAI },
  gptbot: { name: "GPTBot", ...OPENAI },
  "claude-user": { name: "Claude", ...ANTHROPIC },
  "claude-searchbot": { name: "Claude Search", ...ANTHROPIC },
  claudebot: { name: "ClaudeBot", ...ANTHROPIC },
  "perplexity-user": { name: "Perplexity", logo: Perplexity as Logo },
  perplexitybot: { name: "PerplexityBot", logo: Perplexity as Logo },
  "mistral-user": { name: "Le Chat", logo: Mistral as Logo },
  duckassist: { name: "DuckAssist", logo: Duckduckgo as Logo },
  duckduckbot: { name: "DuckDuckBot", logo: Duckduckgo as Logo },
  "meta-fetcher": { name: "Meta AI", logo: Meta as Logo },
  "meta-agent": { name: "Meta AI training", logo: Meta as Logo },
  vertex: { name: "Gemini (Vertex)", logo: Gemini as Logo },
  googleother: { name: "GoogleOther", ...GOOGLE },
  googlebot: { name: "Googlebot", ...GOOGLE },
  bingbot: { name: "Bingbot", logo: MicrosoftBing as Logo },
  applebot: { name: "Applebot", logo: Apple as Logo, variant: "mono" },
  yandexbot: { name: "YandexBot", logo: Yandex as Logo },
  youbot: { name: "YouBot" },
  ccbot: { name: "CCBot" },
  bytespider: { name: "Bytespider", logo: Bytedance as Logo },
  amazonbot: { name: "Amazonbot", logo: Amazon as Logo },
  cohere: { name: "Cohere", logo: Cohere as Logo },
  diffbot: { name: "Diffbot" },
}

export const CATEGORIES: { key: CrawlCategory; label: string; hint: string }[] =
  [
    {
      key: "answers",
      label: "AI answers",
      hint: "Assistants fetching your pages live to answer a user",
    },
    {
      key: "indexing",
      label: "Indexing",
      hint: "Search engines and AI search indexes",
    },
    {
      key: "training",
      label: "Training",
      hint: "Crawlers collecting data to train models",
    },
  ]

export const crawlerName = (id: string): string => META[id]?.name ?? id

type CrawlerLogoType = { crawler: string; className?: string }

export const CrawlerLogo = ({ crawler, className }: CrawlerLogoType) => {
  const meta = META[crawler]
  const Icon = meta?.logo
  if (!Icon) {
    return (
      <RobotIcon
        aria-hidden
        className={cn("size-4 text-muted-foreground", className)}
      />
    )
  }
  return (
    <Icon
      aria-hidden="true"
      variant={meta.variant}
      className={cn("size-4 shrink-0", className)}
    />
  )
}
