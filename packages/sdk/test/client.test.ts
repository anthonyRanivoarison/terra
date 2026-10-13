import { describe, expect, test } from "bun:test"
import { Terra, TerraError } from "../src/index"

type Call = { url: string; init: RequestInit }

const KEY = `tk_live_${"a".repeat(40)}`

function mock(responses: (Response | Error)[]) {
  const calls: Call[] = []
  const fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    const next = responses.shift()
    if (!next) throw new Error("no more responses")
    if (next instanceof Error) throw next
    return next
  }) as unknown as typeof globalThis.fetch
  return { calls, fetch }
}

const json = (status: number, body: unknown, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  })

const client = (fetch: typeof globalThis.fetch) =>
  new Terra({ apiKey: KEY, baseUrl: "https://terra.test/", fetch })

describe("Terra", () => {
  test("requires an api key and a base url outside browsers", () => {
    expect(() => new Terra({ apiKey: "" })).toThrow(TypeError)
    expect(() => new Terra({ apiKey: KEY })).toThrow(/baseUrl/)
  })

  test("lists sites with the bearer key", async () => {
    const { calls, fetch } = mock([json(200, { data: [{ id: "ws_1" }] })])
    const sites = await client(fetch).sites()
    expect(sites).toEqual([{ id: "ws_1" }] as never)
    expect(calls[0]!.url).toBe("https://terra.test/api/v1/sites")
    const headers = calls[0]!.init.headers as Record<string, string>
    expect(headers.authorization).toBe(`Bearer ${KEY}`)
    expect(calls[0]!.init.method).toBe("GET")
  })

  test("serialises stats queries and filters", async () => {
    const { calls, fetch } = mock([json(200, { data: { current: {} } })])
    await client(fetch).stats("ws_abcdefgh", {
      from: new Date("2026-01-01T00:00:00Z"),
      to: "2026-01-31",
      compare: "prev",
      filters: { country: "FR", page: "/pricing" },
    })
    const url = new URL(calls[0]!.url)
    expect(url.pathname).toBe("/api/v1/sites/ws_abcdefgh/stats")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      range: "custom",
      from: "2026-01-01",
      to: "2026-01-31",
      compare: "prev",
      country: "FR",
      page: "/pricing",
    })
  })

  test("breakdown and visits pass section and page", async () => {
    const { calls, fetch } = mock([
      json(200, { data: [] }),
      json(200, { data: { rows: [], hasMore: false } }),
    ])
    const terra = client(fetch)
    await terra.breakdown("ws_abcdefgh", "events", { range: "30d" })
    await terra.visits("ws_abcdefgh", { page: 2 })
    expect(calls[0]!.url).toContain("section=events")
    expect(calls[0]!.url).toContain("range=30d")
    expect(calls[1]!.url).toContain("/visits?pageNumber=2")
  })

  test("track sends JSON with a generated idempotency id", async () => {
    const { calls, fetch } = mock([json(201, { data: { id: "e1" } })])
    await client(fetch).track("ws_abcdefgh", {
      name: "signup",
      visitorId: "visitor_123",
      timestamp: new Date("2026-01-01T00:00:00Z"),
    })
    const body = JSON.parse(String(calls[0]!.init.body))
    expect(calls[0]!.init.method).toBe("POST")
    expect(body.name).toBe("signup")
    expect(body.timestamp).toBe("2026-01-01T00:00:00.000Z")
    expect(typeof body.id).toBe("string")
    const headers = calls[0]!.init.headers as Record<string, string>
    expect(headers["content-type"]).toBe("application/json")
  })

  test("throws TerraError with status and code", async () => {
    const { fetch } = mock([
      json(403, { error: { code: "forbidden", message: "Missing scope" } }),
    ])
    const error = await client(fetch)
      .payment("ws_abcdefgh", {
        id: "pi_1",
        visitorId: "visitor_123",
        amount: 1000,
        currency: "USD",
      })
      .catch((e) => e)
    expect(error).toBeInstanceOf(TerraError)
    expect(error.status).toBe(403)
    expect(error.code).toBe("forbidden")
    expect(error.message).toBe("Missing scope")
  })

  test("retries 429 and 5xx up to twice", async () => {
    const { calls, fetch } = mock([
      json(
        429,
        { error: { code: "rate_limited", message: "slow" } },
        {
          "retry-after": "0",
        }
      ),
      json(503, { error: { code: "internal_error", message: "down" } }),
      json(200, { data: { online: 3 } }),
    ])
    const data = await client(fetch).realtime("ws_abcdefgh")
    expect(data.online).toBe(3)
    expect(calls).toHaveLength(3)
  })

  test("gives up after two retries", async () => {
    const { calls, fetch } = mock([
      json(500, { error: { code: "internal_error", message: "a" } }),
      json(500, { error: { code: "internal_error", message: "b" } }),
      json(500, { error: { code: "internal_error", message: "c" } }),
    ])
    const error = await client(fetch)
      .sites()
      .catch((e) => e)
    expect(error.code).toBe("internal_error")
    expect(error.message).toBe("c")
    expect(calls).toHaveLength(3)
  })

  test("does not retry client errors and retries network errors", async () => {
    const bad = mock([
      json(400, { error: { code: "invalid_request", message: "x" } }),
    ])
    await client(bad.fetch)
      .sites()
      .catch(() => {})
    expect(bad.calls).toHaveLength(1)
    const flaky = mock([new Error("ECONNRESET"), json(200, { data: [] })])
    expect(await client(flaky.fetch).sites()).toEqual([])
    expect(flaky.calls).toHaveLength(2)
  })
})
