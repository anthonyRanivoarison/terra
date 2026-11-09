import { siteConfig } from "@/lib/seo"

export type Announcement = {
  id: string
  kind: string
  title: string
  image: string
  href: string
  external?: boolean
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "open-source",
    kind: "New",
    title: "Terra is now open source",
    image: "/auth-night.webp",
    href: siteConfig.github,
    external: true,
  },
  {
    id: "ai-crawlers",
    kind: "Guide",
    title: "Track AI crawlers",
    image: "/auth-pattern.webp",
    href: "/docs/api",
  },
]
