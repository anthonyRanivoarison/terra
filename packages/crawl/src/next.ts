import { track, requestHit, type CrawlerOptions } from "./index.js"

export type { CrawlerOptions } from "./index.js"

type FetchEvent = { waitUntil(promise: Promise<unknown>): void }

type ProxyResult = Response | null | undefined | void

type Proxy<R extends Request, E extends FetchEvent> = (
  request: R,
  event: E
) => ProxyResult | Promise<ProxyResult>

export function trackCrawler(
  request: Request,
  event: FetchEvent,
  options: CrawlerOptions & { status?: number; ip?: string | null } = {}
): void {
  const { status, ip, ...rest } = options
  void track(requestHit(request, status, ip), rest, (promise) =>
    event.waitUntil(promise)
  )
}

export function withCrawlerTracking<R extends Request, E extends FetchEvent>(
  proxy: Proxy<R, E>,
  options: CrawlerOptions = {}
): (request: R, event: E) => Promise<ProxyResult> {
  return async (request, event) => {
    const response = await proxy(request, event)
    trackCrawler(request, event, {
      ...options,
      status: response ? response.status : 200,
    })
    return response
  }
}
