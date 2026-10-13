const CRAWLER =
  /ChatGPT-User|OAI-SearchBot|GPTBot|Claude-User|Claude-SearchBot|ClaudeBot|anthropic-ai|Perplexity-User|PerplexityBot|MistralAI-User|DuckAssistBot|meta-external(?:fetcher|agent)|Google-CloudVertexBot|GoogleOther|Googlebot|bingbot|Applebot|DuckDuckBot|YandexBot|YouBot|CCBot|Bytespider|Amazonbot|cohere-(?:ai|training)|Diffbot/i

const STATIC_ASSET =
  /^\/(?:_next\/(?:static|image)|static|assets|build)\/|\.(?:m?js|css|map|png|jpe?g|gif|webp|avif|svg|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|ogg|zip|gz|br|wasm)$/i

const IP_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-vercel-forwarded-for",
  "x-real-ip",
  "x-forwarded-for",
  "fly-client-ip",
] as const

export type HeaderGetter = (name: string) => string | null | undefined

export function isLikelyCrawler(userAgent: string | null | undefined): boolean {
  return !!userAgent && CRAWLER.test(userAgent)
}

export function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET.test(pathname)
}

export function clientIp(get: HeaderGetter): string | null {
  for (const name of IP_HEADERS) {
    const first = get(name)?.split(",")[0]?.trim()
    if (first && first !== "unknown" && first.length <= 64) return first
  }
  return null
}

export function stripQuery(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!/^https?:$/.test(parsed.protocol)) return null
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return null
  }
}
