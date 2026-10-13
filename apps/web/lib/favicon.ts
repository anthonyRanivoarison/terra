const TIMEOUT_MS = 3000
const MAX_BYTES = 200 * 1024
const TTL_MS = 24 * 60 * 60 * 1000
const MAX_ENTRIES = 500

export type Favicon = { body: ArrayBuffer; type: string }

const cache = new Map<string, { icon: Favicon; expires: number }>()

const LINK = /<link\b[^>]*>/gi
const ATTR = /([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi
const RELS = ["icon", "shortcut icon", "apple-touch-icon"]

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [, key, a, b, c] of tag.matchAll(ATTR))
    result[key!.toLowerCase()] = a ?? b ?? c ?? ""
  return result
}

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|\[.*\]|[\d.]+)$/i

function safeUrl(href: string, base?: string): URL | null {
  try {
    const url = new URL(href, base)
    const web = url.protocol === "https:" || url.protocol === "http:"
    return web && !PRIVATE_HOST.test(url.hostname) ? url : null
  } catch {
    return null
  }
}

async function readCapped(
  res: Response,
  max: number,
  truncate = false
): Promise<Uint8Array> {
  const reader = res.body?.getReader()
  if (!reader) return new Uint8Array()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (total + value.byteLength > max) {
      await reader.cancel()
      if (!truncate) throw new Error("too large")
      break
    }
    total += value.byteLength
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.byteLength
  }
  return out
}

const get = (url: URL | string, accept: string) =>
  fetch(url, {
    headers: { accept, "user-agent": "TerraFaviconBot/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

async function candidates(domain: string): Promise<URL[]> {
  const home = `https://${domain}/`
  const fallback = new URL("/favicon.ico", home)
  try {
    const res = await get(home, "text/html")
    const html = res.headers.get("content-type")?.includes("html")
    if (!res.ok || !html || !safeUrl(res.url)) return [fallback]
    const page = new TextDecoder().decode(
      await readCapped(res, 512 * 1024, true)
    )
    const head = page.split(/<\/head>/i)[0] ?? page
    const links = [...head.matchAll(LINK)]
      .map(([tag]) => attributes(tag))
      .filter((a) => RELS.includes((a.rel ?? "").toLowerCase().trim()))
      .sort(
        (a, b) =>
          RELS.indexOf(a.rel!.toLowerCase()) -
          RELS.indexOf(b.rel!.toLowerCase())
      )
      .map((a) => safeUrl(a.href ?? "", res.url || home))
      .filter((url): url is URL => url !== null)
    return [...links, fallback]
  } catch {
    return [fallback]
  }
}

async function download(url: URL): Promise<Favicon | null> {
  try {
    const res = await get(url, "image/*")
    const type = res.headers.get("content-type")?.split(";")[0]?.trim() ?? ""
    if (!res.ok || !type.startsWith("image/") || !safeUrl(res.url)) return null
    const bytes = await readCapped(res, MAX_BYTES)
    if (bytes.byteLength === 0) return null
    return { body: bytes.buffer as ArrayBuffer, type }
  } catch {
    return null
  }
}

export async function fetchFavicon(domain: string): Promise<Favicon | null> {
  const hit = cache.get(domain)
  if (hit && hit.expires > Date.now()) return hit.icon
  for (const url of (await candidates(domain)).slice(0, 4)) {
    const icon = await download(url)
    if (!icon) continue
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!)
    cache.set(domain, { icon, expires: Date.now() + TTL_MS })
    return icon
  }
  return null
}
