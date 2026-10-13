export function getClientIp(request: Request): string | null {
  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
  ]

  for (const value of candidates) {
    if (!value) continue
    const first = value.split(",")[0]?.trim()
    if (first && first !== "unknown") return first
  }

  return null
}
