# @terra-analytics/crawl

Server-side AI crawler and search bot tracking for [Terra](https://github.com/terra-analytics/terra).

AI assistants (ChatGPT, Claude, Perplexity…), search engines and training crawlers never run JavaScript, so a client-side script cannot see them. This package reports their requests from your server instead:

- zero runtime dependencies, works on Node 18+, Bun, Deno, Vercel, Netlify and Cloudflare Workers
- never blocks your response: the report is sent in the background (`waitUntil` when the platform has one)
- cheap pre-filter: only likely crawlers are reported, and static assets (`/_next/static`, images, fonts, scripts, styles) are skipped
- privacy first: it sends the user agent, the URL **without query string**, the client IP and the response status. Cookies, auth headers, request bodies and environment variables are never forwarded

Terra reclassifies every user agent server-side, verifies the IP against the ranges each crawler operator publishes (OpenAI, Google, Bing, Apple, Perplexity, DuckDuckGo, Mistral, Common Crawl) and groups crawlers into **AI answers**, **Indexing** and **Training**.

## Install

```bash
npm install @terra-analytics/crawl
# or: bun add / pnpm add / yarn add
```

Set three environment variables (find them in your site settings, under **Bot tracking**):

```bash
TERRA_WEBSITE_ID=ws_xxxxxxxxxxxx
TERRA_BOT_TOKEN=bt_xxxxxxxxxxxxxxxxxxxxxxxx
TERRA_INGEST_URL=https://ingest.your-terra.dev
```

Every helper also accepts `{ websiteId, token, endpoint }` explicitly.

## Next.js (16+, `proxy.ts`)

```ts
import { withCrawlerTracking } from "@terra-analytics/crawl/next"
import { NextResponse } from "next/server"

export const proxy = withCrawlerTracking(() => NextResponse.next())

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

Already have a proxy? Wrap it, or call `trackCrawler(request, event)` inside it:

```ts
import { trackCrawler } from "@terra-analytics/crawl/next"
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server"

export function proxy(request: NextRequest, event: NextFetchEvent) {
  trackCrawler(request, event)
  return NextResponse.next()
}
```

## Hono

```ts
import { Hono } from "hono"
import { crawlerTracker } from "@terra-analytics/crawl/hono"

const app = new Hono()
app.use(crawlerTracker())
```

## Express

```ts
import express from "express"
import { crawlerTracker } from "@terra-analytics/crawl/express"

const app = express()
app.set("trust proxy", true)
app.use(crawlerTracker())
```

The Express adapter uses `req.ip`, so configure `trust proxy` to match your load balancer.

## Cloudflare Workers

```ts
import { withCrawlerTracking } from "@terra-analytics/crawl/worker"

export default {
  fetch: withCrawlerTracking(async (request, env, ctx) => {
    return fetch(request)
  }),
}
```

Add `TERRA_WEBSITE_ID`, `TERRA_BOT_TOKEN` and `TERRA_INGEST_URL` as Worker variables (the token as a secret).

## Anything else

```ts
import { trackCrawlerRequest } from "@terra-analytics/crawl"

trackCrawlerRequest({
  request,
  status: response.status,
  websiteId: "ws_xxxxxxxxxxxx",
  token: process.env.TERRA_BOT_TOKEN,
  endpoint: "https://ingest.your-terra.dev",
  waitUntil: (promise) => ctx.waitUntil(promise),
})
```

`trackCrawlerRequest` returns a promise that resolves to `true` when the hit was accepted. It never throws; pass `onError` to log failures.

## Security notes

The client IP is read from `cf-connecting-ip`, `true-client-ip`, `x-vercel-forwarded-for`, `x-real-ip`, `x-forwarded-for` or `fly-client-ip`. On platforms that do not overwrite these headers, pass `ip` explicitly so a spoofed header cannot mark a fake crawler as verified.

## License

MIT
