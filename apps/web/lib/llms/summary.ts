import { siteConfig } from "@/lib/seo"

export function llmsSummary(): string {
  const url = siteConfig.url
  return `# Terra

> Terra is free, self-hostable, privacy-friendly web analytics. Add a site, paste one script and see where your visitors and your revenue come from, including traffic from AI assistants such as ChatGPT, Claude, Perplexity and Google.

Terra is an open alternative to Google Analytics, Plausible and DataFast. It uses first-party, cookieless tracking and attributes revenue to the channel, campaign, referrer and page that produced it.

## Features

- First-party tracking: one lightweight script, no cookies, no personal data stored, works behind your own domain.
- Subdomains: one site covers \`example.com\` and every \`*.example.com\` subdomain.
- Revenue attribution: connect Paddle and see revenue per source, campaign, country and page, with refunds handled.
- Goals: custom events from JavaScript (\`window.terra.goal\`) or HTML (\`data-goal\` attributes).
- AI crawler tracking: server-side package that reports ChatGPT, Claude, Perplexity, Google and other bots, grouped into AI answers, Indexing and Training, with IP verification.
- Realtime: live visitors, pages and sources.
- Public REST API with API keys and scopes, plus a typed SDK: \`@terra-analytics/sdk\`.
- Server package for crawler tracking: \`@terra-analytics/crawl\` (Next.js, Hono, Express, Cloudflare Workers).
- Self-hosting is free: runs on an Oracle Cloud Always Free ARM VM behind a Cloudflare Tunnel, with backups to Cloudflare R2.

## Docs

- [API reference](${url}/docs/api): interactive reference for the public REST API.
- [OpenAPI schema](${url}/api/v1/openapi.json): machine-readable OpenAPI document.
- [Full LLM context](${url}/llms-full.txt): install snippet, goals, bot tracking and endpoints.

## Optional

- [Brand kit](${url}/brand): logo, colors and typography.
- [Source code](${siteConfig.github})
`
}
