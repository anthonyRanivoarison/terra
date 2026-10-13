import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo"

const ALLOW = [
  "/",
  "/brand",
  "/docs",
  "/llms.txt",
  "/llms-full.txt",
  "/api/v1/openapi.json",
]
const DISALLOW = ["/sites", "/settings", "/api"]
const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: ALLOW, disallow: DISALLOW },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
