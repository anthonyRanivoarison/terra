import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo"

const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/docs/api", priority: 0.8, changeFrequency: "weekly" },
  { path: "/brand", priority: 0.5, changeFrequency: "monthly" },
  { path: "/auth/signup", priority: 0.6, changeFrequency: "yearly" },
  { path: "/auth/signin", priority: 0.3, changeFrequency: "yearly" },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
