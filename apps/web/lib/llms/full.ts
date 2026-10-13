import { llmsSummary } from "@/lib/llms/summary"
import { siteConfig } from "@/lib/seo"

const ENDPOINTS = [
  ["GET", "/api/v1/sites", "List the sites the key can read"],
  ["GET", "/api/v1/sites/{siteId}", "One site"],
  [
    "GET",
    "/api/v1/sites/{siteId}/stats",
    "Visitors, visits, bounce rate, revenue, with comparison",
  ],
  ["GET", "/api/v1/sites/{siteId}/timeseries", "Metrics over time"],
  [
    "GET",
    "/api/v1/sites/{siteId}/breakdown",
    "Top sources, pages, countries, devices, campaigns",
  ],
  ["GET", "/api/v1/sites/{siteId}/realtime", "Live visitors"],
  ["GET", "/api/v1/sites/{siteId}/visits", "Recent visits"],
  [
    "GET",
    "/api/v1/sites/{siteId}/visits/{visitId}",
    "One visit with its journey",
  ],
  [
    "POST",
    "/api/v1/sites/{siteId}/events",
    "Send a server-side goal (write:events)",
  ],
  [
    "POST",
    "/api/v1/sites/{siteId}/payments",
    "Send a purchase or refund (write:payments)",
  ],
]

export function llmsFull(): string {
  const url = siteConfig.url
  const endpoints = ENDPOINTS.map(
    ([method, path, label]) => `- \`${method} ${path}\`: ${label}`
  ).join("\n")
  return `${llmsSummary()}
---

## Install

Add a site in the dashboard, then paste this tag in the \`<head>\` of every page. \`data-website-id\` is the public site id, \`data-domain\` the root domain (subdomains are included).

\`\`\`html
<script
  defer
  data-website-id="ws_..."
  data-domain="example.com"
  src="https://ingest.example.com/js/script.js"
></script>
\`\`\`

Optional attributes: \`data-api\` (custom ingest origin), \`data-allow-localhost="true"\`, \`data-debug="true"\`. Page views, single-page navigations, outbound clicks and Web Vitals are tracked automatically.

## Goals

From JavaScript:

\`\`\`js
window.terra.goal("signup", { plan: "pro" })
\`\`\`

From HTML, without JavaScript. Every \`data-goal-*\` attribute becomes a property (\`data-goal-plan\` → \`plan\`):

\`\`\`html
<button data-goal="signup" data-goal-plan="pro">Start free</button>
\`\`\`

## Revenue attribution

Connect Paddle in the site settings. Terra links each payment to the visitor that made it and credits the source, campaign and landing page. Refunds are subtracted. Payments from other providers can be sent with \`POST /api/v1/sites/{siteId}/payments\`.

## AI crawler and bot tracking

AI assistants and search crawlers do not run JavaScript, so Terra tracks them from your server:

\`\`\`bash
npm install @terra-analytics/crawl
\`\`\`

\`\`\`ts
import { withCrawlerTracking } from "@terra-analytics/crawl/next"
import { NextResponse } from "next/server"

export const proxy = withCrawlerTracking(() => NextResponse.next())
\`\`\`

Set \`TERRA_WEBSITE_ID\`, \`TERRA_BOT_TOKEN\` and \`TERRA_INGEST_URL\`. Adapters exist for Next.js, Hono, Express and Cloudflare Workers. Only the user agent, the URL without query string, the IP and the status are sent.

## REST API and SDK

Create an API key in Settings → API keys with the scopes \`read:stats\`, \`write:events\` or \`write:payments\`, and send it as \`Authorization: Bearer <key>\`.

\`\`\`ts
import { Terra } from "@terra-analytics/sdk"

const terra = new Terra({ apiKey: process.env.TERRA_API_KEY!, baseUrl: "${url}" })
const { current } = await terra.stats("ws_...", { range: "30d" })
\`\`\`

Endpoints:

${endpoints}

Reference: ${url}/docs/api · Schema: ${url}/api/v1/openapi.json

## Self-hosting

Terra is free to self-host: Bun, Next.js and PostgreSQL in Docker, on an Oracle Cloud Always Free ARM VM behind a Cloudflare Tunnel, with nightly backups to Cloudflare R2.
`
}
