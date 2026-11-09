"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Snippet } from "./snippet"

type BotTrackingSnippetType = {
  websiteId: string
  token: string
  ingestUrl: string
}

const INSTALL = "npm install @terra-analytics/crawl"

const FRAMEWORKS = [
  {
    key: "next",
    label: "Next.js",
    file: "proxy.ts",
    code: `import { withCrawlerTracking } from "@terra-analytics/crawl/next"
import { NextResponse } from "next/server"

export const proxy = withCrawlerTracking(() => NextResponse.next())

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}`,
  },
  {
    key: "hono",
    label: "Hono",
    file: "app.ts",
    code: `import { Hono } from "hono"
import { crawlerTracker } from "@terra-analytics/crawl/hono"

const app = new Hono()
app.use(crawlerTracker())`,
  },
  {
    key: "express",
    label: "Express",
    file: "server.ts",
    code: `import express from "express"
import { crawlerTracker } from "@terra-analytics/crawl/express"

const app = express()
app.set("trust proxy", true)
app.use(crawlerTracker())`,
  },
  {
    key: "worker",
    label: "Workers",
    file: "worker.ts",
    code: `import { withCrawlerTracking } from "@terra-analytics/crawl/worker"

export default {
  fetch: withCrawlerTracking((request) => fetch(request)),
}`,
  },
] as const

export const BotTrackingSnippet = ({
  websiteId,
  token,
  ingestUrl,
}: BotTrackingSnippetType) => {
  const env = `TERRA_WEBSITE_ID=${websiteId}
TERRA_BOT_TOKEN=${token}
TERRA_INGEST_URL=${ingestUrl.replace(/\/+$/, "")}`
  return (
    <div id="bot-tracking" className="flex scroll-mt-20 flex-col gap-4">
      <ol className="flex flex-col gap-4 text-sm">
        <li className="flex flex-col gap-2">
          <span className="font-medium">1. Install the package</span>
          <Snippet code={INSTALL} label="install command" />
        </li>
        <li className="flex flex-col gap-2">
          <span className="font-medium">
            2. Add these environment variables
          </span>
          <span className="text-muted-foreground">
            Keep the token secret: it only lets a server report crawls for this
            site.
          </span>
          <Snippet code={env} label="environment variables" />
        </li>
        <li className="flex flex-col gap-2">
          <span className="font-medium">3. Report crawler requests</span>
          <Tabs defaultValue="next">
            <TabsList>
              {FRAMEWORKS.map((f) => (
                <TabsTrigger key={f.key} value={f.key}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {FRAMEWORKS.map((f) => (
              <TabsContent
                key={f.key}
                value={f.key}
                className="flex flex-col gap-1.5"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {f.file}
                </span>
                <Snippet code={f.code} label={`${f.label} snippet`} />
              </TabsContent>
            ))}
          </Tabs>
        </li>
      </ol>
      <p className="text-xs text-muted-foreground">
        Only the user agent, the URL without its query string, the IP and the
        response status are sent. Requests are reported in the background and
        never slow your pages down. Terra checks each IP against the ranges
        published by OpenAI, Google, Bing, Apple, Perplexity and others.
      </p>
    </div>
  )
}
