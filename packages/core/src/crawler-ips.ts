import { ipInRanges, parsePrefixes, type Cidr } from "./crawler-ips-cidr"
import type { Crawler, IpSource } from "./crawlers"

export { isIp, parseIp, parseCidr, ipInRanges } from "./crawler-ips-cidr"

const GOOGLE = "https://developers.google.com/static/crawling/ipranges"

export const IP_SOURCES: Record<IpSource, readonly string[]> = {
  "openai-chatgpt-user": ["https://openai.com/chatgpt-user.json"],
  "openai-searchbot": ["https://openai.com/searchbot.json"],
  "openai-gptbot": ["https://openai.com/gptbot.json"],
  googlebot: [`${GOOGLE}/common-crawlers.json`],
  "google-special": [`${GOOGLE}/special-crawlers.json`],
  bingbot: ["https://www.bing.com/toolbox/bingbot.json"],
  applebot: ["https://search.developer.apple.com/applebot.json"],
  perplexitybot: ["https://www.perplexity.com/perplexitybot.json"],
  "perplexity-user": ["https://www.perplexity.com/perplexity-user.json"],
  duckduckbot: ["https://duckduckgo.com/duckduckbot.json"],
  duckassistbot: ["https://duckduckgo.com/duckassistbot.json"],
  "mistral-user": ["https://mistral.ai/mistralai-user-ips.json"],
  ccbot: ["https://index.commoncrawl.org/ccbot.json"],
}

const TTL_MS = 24 * 60 * 60 * 1000
const RETRY_MS = 5 * 60 * 1000
const FETCH_TIMEOUT_MS = 5000

type Entry = { at: number; ttl: number; ranges: Promise<Cidr[] | null> }

type Fetcher = (url: string, init: RequestInit) => Promise<Response>

const cache = new Map<IpSource, Entry>()
let fetcher: Fetcher = (url, init) => fetch(url, init)

export function setCrawlerIpFetcher(next: Fetcher | null): void {
  fetcher = next ?? ((url, init) => fetch(url, init))
  cache.clear()
}

async function download(url: string): Promise<Cidr[]> {
  const response = await fetcher(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  const ranges = parsePrefixes(await response.json())
  if (!ranges.length) throw new Error(`${url} has no prefixes`)
  return ranges
}

function load(source: IpSource): Promise<Cidr[] | null> {
  const hit = cache.get(source)
  if (hit && Date.now() - hit.at < hit.ttl) return hit.ranges
  const entry: Entry = {
    at: Date.now(),
    ttl: TTL_MS,
    ranges: Promise.all(IP_SOURCES[source].map(download))
      .then((lists) => lists.flat())
      .catch((error) => {
        console.warn(`[crawler-ips] ${source} unavailable`, error)
        entry.ttl = RETRY_MS
        return hit ? hit.ranges : null
      }),
  }
  cache.set(source, entry)
  return entry.ranges
}

export function crawlerIpRanges(source: IpSource): Promise<Cidr[] | null> {
  return load(source)
}

export async function verifyCrawlerIp(
  crawler: Pick<Crawler, "ipSource"> | null | undefined,
  ip: string | null | undefined
): Promise<boolean | null> {
  if (!crawler?.ipSource || !ip) return null
  const ranges = await load(crawler.ipSource)
  if (!ranges) return null
  return ipInRanges(ip, ranges)
}
