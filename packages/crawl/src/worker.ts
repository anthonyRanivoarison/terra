import { trackCrawlerRequest, type CrawlerOptions } from "./index.js"

export type { CrawlerOptions } from "./index.js"

type ExecutionContext = { waitUntil(promise: Promise<unknown>): void }

type Env = {
  TERRA_WEBSITE_ID?: string
  TERRA_BOT_TOKEN?: string
  TERRA_INGEST_URL?: string
}

type Handler<E> = (
  request: Request,
  env: E,
  ctx: ExecutionContext
) => Response | Promise<Response>

export function trackCrawler(
  request: Request,
  response: Response,
  env: Env,
  ctx: ExecutionContext,
  options: CrawlerOptions = {}
): void {
  void trackCrawlerRequest({
    ...options,
    request,
    status: response.status,
    websiteId: options.websiteId ?? env.TERRA_WEBSITE_ID,
    token: options.token ?? env.TERRA_BOT_TOKEN,
    endpoint: options.endpoint ?? env.TERRA_INGEST_URL,
    waitUntil: (promise) => ctx.waitUntil(promise),
  })
}

export function withCrawlerTracking<E extends Env>(
  handler: Handler<E>,
  options: CrawlerOptions = {}
): Handler<E> {
  return async (request, env, ctx) => {
    const response = await handler(request, env, ctx)
    trackCrawler(request, response, env, ctx, options)
    return response
  }
}
