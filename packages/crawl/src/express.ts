import { clientIp, track, type CrawlerOptions } from "./index.js"

export type { CrawlerOptions } from "./index.js"

type HeaderValue = string | string[] | undefined

type ExpressRequest = {
  headers: Record<string, HeaderValue>
  originalUrl?: string
  url?: string
  protocol?: string
  ip?: string
}

type ExpressResponse = {
  statusCode: number
  once(event: "finish", listener: () => void): unknown
}

function header(req: ExpressRequest, name: string): string | undefined {
  const value = req.headers[name]
  return Array.isArray(value) ? value[0] : value
}

export function crawlerTracker(options: CrawlerOptions = {}) {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void) => {
    const userAgent = header(req, "user-agent")
    const host = header(req, "x-forwarded-host") ?? header(req, "host")
    if (userAgent && host) {
      res.once("finish", () => {
        const protocol = req.protocol ?? "https"
        void track(
          {
            url: `${protocol}://${host}${req.originalUrl ?? req.url ?? "/"}`,
            userAgent,
            ip: req.ip ?? clientIp((name) => header(req, name)),
            status: res.statusCode,
          },
          options
        )
      })
    }
    next()
  }
}
