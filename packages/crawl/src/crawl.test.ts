import { describe, expect, it } from "bun:test"
import { crawlerTracker as expressTracker } from "./express.js"
import { crawlerTracker as honoTracker } from "./hono.js"
import { isLikelyCrawler, isStaticAsset, trackCrawlerRequest } from "./index.js"
import { withCrawlerTracking as nextTracking } from "./next.js"
import { withCrawlerTracking as workerTracking } from "./worker.js"

const GPTBOT = "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2"
const CHROME = "Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0 Safari/537.36"

type Call = { url: string; init: RequestInit; body: Record<string, unknown> }

const recorder = () => {
  const calls: Call[] = []
  const fetch = async (url: string, init: RequestInit) => {
    calls.push({ url, init, body: JSON.parse(String(init.body)) })
    return new Response(null, { status: 202 })
  }
  return { calls, fetch }
}

const opts = {
  websiteId: "ws_abc",
  token: "bt_secret",
  endpoint: "https://in.terra.dev/",
}

const request = (path: string, ua: string) =>
  new Request(`https://site.dev${path}`, {
    headers: {
      "user-agent": ua,
      cookie: "session=private",
      authorization: "Bearer user-token",
      "x-forwarded-for": "20.171.206.9, 10.0.0.1",
    },
  })

describe("detection", () => {
  it("spots crawlers and static assets", () => {
    expect(isLikelyCrawler(GPTBOT)).toBe(true)
    expect(isLikelyCrawler("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(
      true
    )
    expect(isLikelyCrawler(CHROME)).toBe(false)
    expect(isStaticAsset("/_next/static/chunks/a.js")).toBe(true)
    expect(isStaticAsset("/logo.svg")).toBe(true)
    expect(isStaticAsset("/robots.txt")).toBe(false)
    expect(isStaticAsset("/blog/post")).toBe(false)
  })
})

describe("trackCrawlerRequest", () => {
  it("posts a minimal payload and never forwards secrets", async () => {
    const { calls, fetch } = recorder()
    let waited: Promise<unknown> | null = null
    const sent = await trackCrawlerRequest({
      ...opts,
      fetch,
      request: request("/pricing?token=abc#x", GPTBOT),
      status: 200,
      waitUntil: (p) => (waited = p),
    })
    expect(sent).toBe(true)
    expect(waited).not.toBeNull()
    expect(calls).toHaveLength(1)
    const [call] = calls
    expect(call?.url).toBe("https://in.terra.dev/api/crawl")
    expect(call?.body).toEqual({
      websiteId: "ws_abc",
      userAgent: GPTBOT,
      url: "https://site.dev/pricing",
      ip: "20.171.206.9",
      status: 200,
    })
    const headers = call?.init.headers as Record<string, string>
    expect(Object.keys(headers).sort()).toEqual([
      "authorization",
      "content-type",
    ])
    expect(headers.authorization).toBe("Bearer bt_secret")
    expect(String(call?.init.body)).not.toContain("private")
    expect(String(call?.init.body)).not.toContain("user-token")
  })

  it("skips humans, assets and missing config", async () => {
    const { calls, fetch } = recorder()
    await trackCrawlerRequest({ ...opts, fetch, request: request("/", CHROME) })
    await trackCrawlerRequest({
      ...opts,
      fetch,
      request: request("/a.css", GPTBOT),
    })
    await trackCrawlerRequest({ fetch, request: request("/", GPTBOT) })
    expect(calls).toHaveLength(0)
  })

  it("swallows network errors", async () => {
    let seen: unknown = null
    const sent = await trackCrawlerRequest({
      ...opts,
      request: request("/", GPTBOT),
      fetch: async () => {
        throw new Error("down")
      },
      onError: (error) => (seen = error),
    })
    expect(sent).toBe(false)
    expect(seen).toBeInstanceOf(Error)
  })
})

describe("adapters", () => {
  it("next proxy wrapper uses event.waitUntil and the response status", async () => {
    const { calls, fetch } = recorder()
    const pending: Promise<unknown>[] = []
    const proxy = nextTracking(() => new Response(null, { status: 307 }), {
      ...opts,
      fetch,
    })
    await proxy(request("/docs", GPTBOT), { waitUntil: (p) => pending.push(p) })
    await Promise.all(pending)
    expect(pending).toHaveLength(1)
    expect(calls[0]?.body.status).toBe(307)
  })

  it("hono middleware reports after next()", async () => {
    const { calls, fetch } = recorder()
    const c = {
      req: { raw: request("/", GPTBOT) },
      res: new Response("ok", { status: 404 }),
      get executionCtx(): { waitUntil(p: Promise<unknown>): void } {
        throw new Error("no ctx")
      },
    }
    await honoTracker({ ...opts, fetch })(c, async () => {})
    await Bun.sleep(5)
    expect(calls[0]?.body.status).toBe(404)
  })

  it("express middleware reports on finish with req.ip", async () => {
    const { calls, fetch } = recorder()
    let finish = () => {}
    const res = {
      statusCode: 200,
      once: (_: "finish", fn: () => void) => (finish = fn),
    }
    let nexted = false
    expressTracker({ ...opts, fetch })(
      {
        headers: { "user-agent": GPTBOT, host: "site.dev" },
        originalUrl: "/a?b=1",
        protocol: "https",
        ip: "::ffff:20.171.206.9",
      },
      res,
      () => (nexted = true)
    )
    expect(nexted).toBe(true)
    finish()
    await Bun.sleep(5)
    expect(calls[0]?.body).toMatchObject({
      url: "https://site.dev/a",
      ip: "::ffff:20.171.206.9",
    })
  })

  it("worker wrapper reads env and ctx.waitUntil", async () => {
    const { calls, fetch } = recorder()
    const pending: Promise<unknown>[] = []
    const handler = workerTracking(() => new Response("hi"), { fetch })
    const env = {
      TERRA_WEBSITE_ID: "ws_env",
      TERRA_BOT_TOKEN: "bt_env",
      TERRA_INGEST_URL: "https://x.dev",
    }
    await handler(request("/", GPTBOT), env, {
      waitUntil: (p) => pending.push(p),
    })
    await Promise.all(pending)
    expect(calls[0]?.url).toBe("https://x.dev/api/crawl")
    expect(calls[0]?.body.websiteId).toBe("ws_env")
  })
})
