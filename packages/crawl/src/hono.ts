import {
  track,
  requestHit,
  type CrawlerOptions,
  type WaitUntil,
} from "./index.js"

export type { CrawlerOptions } from "./index.js"

type HonoContext = {
  req: { raw: Request }
  res: Response
  readonly executionCtx: { waitUntil(promise: Promise<unknown>): void }
}

function waitUntilOf(c: HonoContext): WaitUntil | undefined {
  try {
    const ctx = c.executionCtx
    return (promise) => ctx.waitUntil(promise)
  } catch {
    return undefined
  }
}

export function crawlerTracker(options: CrawlerOptions = {}) {
  return async (c: HonoContext, next: () => Promise<void>): Promise<void> => {
    await next()
    void track(requestHit(c.req.raw, c.res.status), options, waitUntilOf(c))
  }
}
