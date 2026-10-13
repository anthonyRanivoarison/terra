export const RATE_LIMIT = 600
export const RATE_WINDOW_MS = 60_000

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 10_000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function consume(
  key: string,
  now = Date.now()
): { ok: boolean; headers: Record<string, string> } {
  sweep(now)
  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS }
    buckets.set(key, bucket)
  }
  bucket.count += 1
  const ok = bucket.count <= RATE_LIMIT
  const reset = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  const headers: Record<string, string> = {
    "RateLimit-Policy": `${RATE_LIMIT};w=${RATE_WINDOW_MS / 1000}`,
    "RateLimit-Limit": String(RATE_LIMIT),
    "RateLimit-Remaining": String(Math.max(0, RATE_LIMIT - bucket.count)),
    "RateLimit-Reset": String(reset),
  }
  if (!ok) headers["Retry-After"] = String(reset)
  return { ok, headers }
}
