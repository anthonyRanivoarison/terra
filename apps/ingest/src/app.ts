import { getClientIp } from "@terra/core/client-ip"
import { hostAllowed } from "@terra/core/hostname"
import { parsePayload } from "@terra/core/payload"
import { Hono } from "hono"
import { cors } from "hono/cors"
import type { Batcher } from "./batcher"
import { crawlHandler } from "./crawl"
import { isBotRequest, source, visitorInfo, type Job } from "./jobs"
import { allow } from "./limit"
import { findSite, markLive } from "./sites"

type Deps = { queue: Batcher<Job>; script: () => Promise<Response> }

const accepted = () => new Response(null, { status: 202 })

export function createApp({ queue, script }: Deps): Hono {
  const app = new Hono()

  app.get("/health", (c) => c.json({ ok: true, queued: queue.size }))
  app.get("/js/script.js", () => script())
  app.use("/api/event", cors({ origin: "*", allowMethods: ["POST"] }))

  app.post("/api/event", async (c) => {
    const req = c.req.raw
    if (!allow(`event:${getClientIp(req) ?? "?"}`, 300, 60_000)) {
      return c.json({ error: "rate limited" }, 429)
    }
    const payload = parsePayload(await req.json().catch(() => null))
    if (!payload) return c.json({ error: "invalid payload" }, 400)
    const site = await findSite(payload.websiteId)
    if (!site) return c.json({ error: "unknown website" }, 404)
    if (
      "location" in payload &&
      !hostAllowed(payload.location.hostname, site.domain, site.allowed)
    ) {
      return c.json({ error: "hostname not allowed" }, 403)
    }

    if (payload.type === "pageview") {
      const info = await visitorInfo(req, payload.client)
      queue.push({
        kind: "pageview",
        siteId: site.id,
        at: new Date(),
        p: payload,
        info,
        source: source(payload, site),
      })
    } else if (payload.type === "event") {
      queue.push({
        kind: "event",
        siteId: site.id,
        at: new Date(),
        p: payload,
        isBot: isBotRequest(req),
      })
    } else {
      queue.push({ kind: "ping", siteId: site.id, at: new Date(), p: payload })
    }
    if (!site.live) markLive(payload.websiteId)
    return accepted()
  })

  app.post("/api/crawl", crawlHandler(queue))

  return app
}
