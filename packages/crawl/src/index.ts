import {
  clientIp,
  isLikelyCrawler,
  isStaticAsset,
  stripQuery,
  type HeaderGetter,
} from "./detect.js"

export {
  clientIp,
  isLikelyCrawler,
  isStaticAsset,
  stripQuery,
} from "./detect.js"
export type { HeaderGetter } from "./detect.js"

export type WaitUntil = (promise: Promise<unknown>) => void

export type CrawlerOptions = {
  websiteId?: string
  token?: string
  endpoint?: string
  timeoutMs?: number
  fetch?: (input: string, init: RequestInit) => Promise<Response>
  onError?: (error: unknown) => void
}

export type CrawlHit = {
  url: string
  userAgent: string | null | undefined
  ip?: string | null
  status?: number
}

export type TrackCrawlerRequestOptions = CrawlerOptions & {
  request: Request
  status?: number
  ip?: string | null
  waitUntil?: WaitUntil
}

const DEFAULT_TIMEOUT_MS = 3000

function env(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string> } })
    .process
  return proc?.env?.[name] || undefined
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return ""
  }
}

export function shouldTrack(hit: CrawlHit): boolean {
  return isLikelyCrawler(hit.userAgent) && !isStaticAsset(pathOf(hit.url))
}

export async function sendCrawl(
  hit: CrawlHit,
  options: CrawlerOptions = {}
): Promise<boolean> {
  try {
    if (!shouldTrack(hit)) return false
    const websiteId = options.websiteId ?? env("TERRA_WEBSITE_ID")
    const token = options.token ?? env("TERRA_BOT_TOKEN")
    const endpoint = options.endpoint ?? env("TERRA_INGEST_URL")
    const url = stripQuery(hit.url)
    if (!websiteId || !token || !endpoint || !url) return false
    const send = options.fetch ?? fetch
    const response = await send(`${endpoint.replace(/\/+$/, "")}/api/crawl`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        websiteId,
        userAgent: String(hit.userAgent).slice(0, 512),
        url,
        ip: hit.ip ?? null,
        status: hit.status ?? null,
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    })
    return response.ok
  } catch (error) {
    options.onError?.(error)
    return false
  }
}

export function track(
  hit: CrawlHit,
  options: CrawlerOptions,
  waitUntil?: WaitUntil
): Promise<boolean> {
  if (!shouldTrack(hit)) return Promise.resolve(false)
  const pending = sendCrawl(hit, options)
  try {
    waitUntil?.(pending)
  } catch {}
  return pending
}

export function requestHit(
  request: Request,
  status?: number,
  ip?: string | null
): CrawlHit {
  const get: HeaderGetter = (name) => request.headers.get(name)
  return {
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    ip: ip ?? clientIp(get),
    status,
  }
}

export function trackCrawlerRequest({
  request,
  status,
  ip,
  waitUntil,
  ...options
}: TrackCrawlerRequestOptions): Promise<boolean> {
  return track(requestHit(request, status, ip), options, waitUntil)
}
