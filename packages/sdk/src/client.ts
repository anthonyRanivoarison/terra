import { request, type HttpConfig, type RequestOptions } from "./http.js"
import type {
  Breakdown,
  EventStat,
  Goal,
  Payment,
  Realtime,
  Section,
  Site,
  Stats,
  StatsQuery,
  Timeseries,
  VisitDetail,
  VisitPage,
  WrittenEvent,
} from "./types.js"

export type TerraOptions = {
  apiKey: string
  baseUrl?: string
  fetch?: typeof fetch
  maxRetries?: number
  timeoutMs?: number
}

type CallOptions = { signal?: AbortSignal }

function defaultBaseUrl(): string {
  const origin = (globalThis as { location?: { origin?: string } }).location
    ?.origin
  if (origin && origin !== "null") return origin
  throw new TypeError("Terra: pass `baseUrl`, the URL of your Terra instance")
}

const day = (value: string | Date | undefined) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value

const time = (value: string | number | Date | undefined) =>
  value instanceof Date ? value.toISOString() : value

function toQuery(query: StatsQuery = {}): Record<string, string | undefined> {
  const custom = query.from !== undefined || query.to !== undefined
  return {
    range: query.range ?? (custom ? "custom" : undefined),
    from: day(query.from),
    to: day(query.to),
    compare: query.compare,
    ...query.filters,
  }
}

function randomId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const site = (siteId: string, path = "") =>
  `/sites/${encodeURIComponent(siteId)}${path}`

export class Terra {
  readonly #config: HttpConfig

  constructor(options: TerraOptions) {
    if (!options?.apiKey) throw new TypeError("Terra: `apiKey` is required")
    const fetchImpl = options.fetch ?? globalThis.fetch
    if (!fetchImpl) throw new TypeError("Terra: no global fetch available")
    this.#config = {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl ?? defaultBaseUrl(),
      fetch: (input, init) => fetchImpl(input, init),
      maxRetries: Math.max(0, Math.min(options.maxRetries ?? 2, 2)),
      timeoutMs: options.timeoutMs ?? 30_000,
    }
  }

  #get<T>(path: string, query?: RequestOptions["query"], opts?: CallOptions) {
    return request<T>(this.#config, "GET", path, { query, ...opts })
  }

  #post<T>(path: string, body: unknown, opts?: CallOptions) {
    return request<T>(this.#config, "POST", path, { body, ...opts })
  }

  sites(opts?: CallOptions): Promise<Site[]> {
    return this.#get("/sites", undefined, opts)
  }

  site(siteId: string, opts?: CallOptions): Promise<Site> {
    return this.#get(site(siteId), undefined, opts)
  }

  stats(
    siteId: string,
    query?: StatsQuery,
    opts?: CallOptions
  ): Promise<Stats> {
    return this.#get(site(siteId, "/stats"), toQuery(query), opts)
  }

  timeseries(
    siteId: string,
    query?: StatsQuery,
    opts?: CallOptions
  ): Promise<Timeseries> {
    return this.#get(site(siteId, "/timeseries"), toQuery(query), opts)
  }

  breakdown(
    siteId: string,
    section: "events",
    query?: StatsQuery,
    opts?: CallOptions
  ): Promise<EventStat[]>
  breakdown(
    siteId: string,
    section: Section,
    query?: StatsQuery,
    opts?: CallOptions
  ): Promise<Breakdown>
  breakdown(
    siteId: string,
    section: Section | "events",
    query?: StatsQuery,
    opts?: CallOptions
  ): Promise<Breakdown | EventStat[]> {
    return this.#get(
      site(siteId, "/breakdown"),
      { section, ...toQuery(query) },
      opts
    )
  }

  realtime(siteId: string, opts?: CallOptions): Promise<Realtime> {
    return this.#get(site(siteId, "/realtime"), undefined, opts)
  }

  visits(
    siteId: string,
    query: StatsQuery & { page?: number } = {},
    opts?: CallOptions
  ): Promise<VisitPage> {
    const page = query.page === undefined ? undefined : String(query.page)
    return this.#get(
      site(siteId, "/visits"),
      { ...toQuery(query), pageNumber: page },
      opts
    )
  }

  visit(
    siteId: string,
    visitId: string,
    opts?: CallOptions
  ): Promise<VisitDetail> {
    return this.#get(
      site(siteId, `/visits/${encodeURIComponent(visitId)}`),
      undefined,
      opts
    )
  }

  track(siteId: string, goal: Goal, opts?: CallOptions): Promise<WrittenEvent> {
    const body = {
      ...goal,
      id: goal.id ?? randomId(),
      timestamp: time(goal.timestamp),
    }
    return this.#post(site(siteId, "/events"), body, opts)
  }

  payment(
    siteId: string,
    payment: Payment,
    opts?: CallOptions
  ): Promise<WrittenEvent> {
    const body = { ...payment, timestamp: time(payment.timestamp) }
    return this.#post(site(siteId, "/payments"), body, opts)
  }
}
