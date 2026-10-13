import {
  crawlerIpRanges,
  IP_SOURCES,
  isIp,
  verifyCrawlerIp,
} from "@terra/core/crawler-ips"
import { classifyCrawler, type IpSource } from "@terra/core/crawlers"
import { hostAllowed } from "@terra/core/hostname"
import { parseLocation } from "@terra/core/payload"
import type { Context } from "hono"
import type { Batcher } from "./batcher"
import type { Job } from "./jobs"
import { allow } from "./limit"
import { findSite } from "./sites"

const VERIFY_TIMEOUT_MS = 300

const STATIC_ASSET =
  /^\/(?:_next\/(?:static|image)|static|assets|build)\/|\.(?:m?js|css|map|png|jpe?g|gif|webp|avif|svg|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|ogg|zip|gz|br|wasm)$/i

export function isStaticAsset(path: string): boolean {
  return STATIC_ASSET.test(path)
}

export function warmCrawlerIps(): void {
  for (const source of Object.keys(IP_SOURCES) as IpSource[]) {
    void crawlerIpRanges(source)
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

const accepted = () => new Response(null, { status: 202 })

type Body = Record<string, unknown> | null

export function crawlHandler(queue: Batcher<Job>) {
  return async (c: Context) => {
    const body = (await c.req.json().catch(() => null)) as Body
    const websiteId = typeof body?.websiteId === "string" ? body.websiteId : ""
    const site = websiteId ? await findSite(websiteId) : null
    const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "")
    if (!site || !token || token !== site.botToken) {
      return c.json({ error: "unauthorized" }, 401)
    }
    if (body?.ip !== undefined && body.ip !== null && !isIp(body.ip)) {
      return c.json({ error: "invalid ip" }, 400)
    }
    if (!allow(`crawl:${site.id}`, 6000, 60_000)) {
      return c.json({ error: "rate limited" }, 429)
    }
    const userAgent = typeof body?.userAgent === "string" ? body.userAgent : ""
    const crawler = classifyCrawler(userAgent.slice(0, 512))
    const location = parseLocation(body?.url)
    if (!crawler || !location || isStaticAsset(location.page)) {
      return accepted()
    }
    if (!hostAllowed(location.hostname, site.domain, site.allowed)) {
      return c.json({ error: "hostname not allowed" }, 403)
    }
    const ip = typeof body?.ip === "string" ? body.ip.trim() : null
    const ipVerified = await withTimeout(
      verifyCrawlerIp(crawler, ip).catch(() => null),
      VERIFY_TIMEOUT_MS
    )
    const status = Number(body?.status)
    queue.push({
      kind: "crawl",
      siteId: site.id,
      at: new Date(),
      crawl: {
        crawler: crawler.id,
        company: crawler.company,
        category: crawler.category,
        hostname: location.hostname,
        path: location.page,
        status:
          Number.isInteger(status) && status >= 100 && status < 600
            ? status
            : null,
        ipVerified,
      },
    })
    return accepted()
  }
}
