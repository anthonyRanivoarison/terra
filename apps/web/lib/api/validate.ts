export type Goal = {
  name: string
  visitorId: string
  props: Record<string, string> | null
  hostname: string | null
  page: string | null
  at: Date
  id: string | null
}

export type Payment = {
  id: string
  visitorId: string
  amount: number
  currency: string
  provider: string
  refunded: boolean
  at: Date
}

type Result<T> = { ok: true; value: T } | { ok: false; message: string }

const VISITOR = /^[A-Za-z0-9_-]{8,64}$/
const EVENT_NAME = /^[a-z0-9_:-]{1,64}$/
const PROP_KEY = /^[a-z0-9_-]{1,64}$/
const PROVIDER = /^[a-z0-9_-]{1,32}$/
const CURRENCY = /^[A-Z]{3}$/
const RESERVED = new Set(["purchase", "refund", "pageview"])
const MAX_AGE_MS = 30 * 86_400_000
const MAX_SKEW_MS = 5 * 60_000

const fail = (message: string) => ({ ok: false as const, message })

const str = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null

function timestamp(value: unknown, now: number): Date | null | undefined {
  if (value === undefined || value === null) return new Date(now)
  const at = new Date(typeof value === "number" ? value : String(value))
  const time = at.getTime()
  if (!Number.isFinite(time)) return undefined
  if (time > now + MAX_SKEW_MS || time < now - MAX_AGE_MS) return null
  return at
}

function props(value: unknown): Result<Record<string, string> | null> {
  if (value === undefined || value === null) return { ok: true, value: null }
  if (typeof value !== "object" || Array.isArray(value)) {
    return fail("`props` must be an object of strings.")
  }
  const entries = Object.entries(value)
  if (entries.length > 10) return fail("`props` accepts at most 10 keys.")
  const out: Record<string, string> = {}
  for (const [key, raw] of entries) {
    const v =
      typeof raw === "number" || typeof raw === "boolean" ? `${raw}` : raw
    const clean = str(v, 255)
    if (!PROP_KEY.test(key)) return fail(`Invalid prop key \`${key}\`.`)
    if (!clean) return fail(`Prop \`${key}\` must be a non-empty string.`)
    out[key] = clean
  }
  return { ok: true, value: entries.length ? out : null }
}

function location(value: unknown) {
  const raw = str(value, 2000)
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (!/^https?:$/.test(url.protocol)) return null
    return {
      hostname: url.hostname.toLowerCase().replace(/^www\./, ""),
      page: url.pathname.slice(0, 300) || "/",
    }
  } catch {
    return null
  }
}

export function parseGoal(body: unknown, now = Date.now()): Result<Goal> {
  if (!body || typeof body !== "object") return fail("Send a JSON object.")
  const b = body as Record<string, unknown>
  const name = str(b.name, 65)
  if (!name || !EVENT_NAME.test(name)) {
    return fail("`name` must match ^[a-z0-9_:-]{1,64}$.")
  }
  if (RESERVED.has(name)) {
    return fail(`\`${name}\` is reserved. Use the payments endpoint.`)
  }
  const visitorId = str(b.visitorId, 65)
  if (!visitorId || !VISITOR.test(visitorId)) {
    return fail("`visitorId` must match ^[A-Za-z0-9_-]{8,64}$.")
  }
  const parsedProps = props(b.props)
  if (!parsedProps.ok) return parsedProps
  const loc = b.url === undefined ? null : location(b.url)
  if (b.url !== undefined && !loc) return fail("`url` must be an http(s) URL.")
  const at = timestamp(b.timestamp, now)
  if (!at) return fail("`timestamp` must be a date within the last 30 days.")
  const id = b.id === undefined ? null : str(b.id, 201)
  if (b.id !== undefined && (!id || id.length > 200)) {
    return fail("`id` must be a string of 1 to 200 characters.")
  }
  return {
    ok: true,
    value: {
      name,
      visitorId,
      props: parsedProps.value,
      hostname: loc?.hostname ?? null,
      page: loc?.page ?? null,
      at,
      id,
    },
  }
}

export function parsePayment(body: unknown, now = Date.now()): Result<Payment> {
  if (!body || typeof body !== "object") return fail("Send a JSON object.")
  const b = body as Record<string, unknown>
  const id = str(b.id, 201)
  if (!id || id.length > 200) {
    return fail("`id` must be a string of 1 to 200 characters.")
  }
  const visitorId = str(b.visitorId, 65)
  if (!visitorId || !VISITOR.test(visitorId)) {
    return fail("`visitorId` must match ^[A-Za-z0-9_-]{8,64}$.")
  }
  const amount = b.amount
  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > 2_147_483_647
  ) {
    return fail("`amount` must be a positive integer in minor units.")
  }
  const currency =
    typeof b.currency === "string" ? b.currency.toUpperCase() : ""
  if (!CURRENCY.test(currency)) {
    return fail("`currency` must be a 3-letter ISO 4217 code.")
  }
  const provider = b.provider === undefined ? "api" : str(b.provider, 33)
  if (!provider || !PROVIDER.test(provider)) {
    return fail("`provider` must match ^[a-z0-9_-]{1,32}$.")
  }
  if (b.refunded !== undefined && typeof b.refunded !== "boolean") {
    return fail("`refunded` must be a boolean.")
  }
  const at = timestamp(b.timestamp, now)
  if (!at) return fail("`timestamp` must be a date within the last 30 days.")
  return {
    ok: true,
    value: {
      id,
      visitorId,
      amount,
      currency,
      provider,
      refunded: b.refunded === true,
      at,
    },
  }
}
