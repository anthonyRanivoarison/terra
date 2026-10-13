export type Utm = {
  source: string | null
  medium: string | null
  campaign: string | null
  term: string | null
  content: string | null
  ref: string | null
}

export type Channel =
  | "Direct"
  | "Organic Search"
  | "Paid Search"
  | "Organic Social"
  | "Paid Social"
  | "Email"
  | "AI"
  | "Affiliate"
  | "Referral"

const KEPT_PARAMS =
  /^(utm_(source|medium|campaign|term|content)|ref|via|source)$/

const SEARCH =
  /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|qwant|brave|startpage|naver|seznam|search\.yahoo)\./
const SOCIAL =
  /(^|\.)(facebook|fb|instagram|t\.co|twitter|x|linkedin|lnkd|reddit|youtube|youtu|tiktok|pinterest|threads|bsky|mastodon|news\.ycombinator|ycombinator|producthunt|discord|telegram|whatsapp|snapchat|quora|medium\.com|dev\.to|indiehackers)\./
const AI =
  /(^|\.)(chatgpt|openai|perplexity|claude|anthropic|gemini|bard|copilot|you|phind|poe|deepseek|mistral|grok)\.(com|ai|chat|google\.com)$|^gemini\.google\.com$|^copilot\.microsoft\.com$/
const EMAIL =
  /(^|\.)(mail\.google|outlook\.live|mail\.yahoo|mail|webmail|proton|fastmail)\./

const clean = (value: string | null, max = 120): string | null => {
  const v = value?.trim().toLowerCase()
  return v ? v.slice(0, max) : null
}

export function keepQuery(search: string): string | null {
  const params = new URLSearchParams(search)
  const kept = new URLSearchParams()
  for (const [key, value] of params) {
    if (KEPT_PARAMS.test(key) && value) kept.append(key, value.slice(0, 120))
  }
  const out = kept.toString()
  return out ? out.slice(0, 500) : null
}

export function parseUtm(query: string | null): Utm {
  const params = new URLSearchParams(query ?? "")
  return {
    source: clean(params.get("utm_source") ?? params.get("source")),
    medium: clean(params.get("utm_medium")),
    campaign: clean(params.get("utm_campaign")),
    term: clean(params.get("utm_term")),
    content: clean(params.get("utm_content")),
    ref: clean(params.get("ref") ?? params.get("via")),
  }
}

export function parseReferrer(
  referrer: string | null,
  ownHost: string | null
): { referrer: string | null; host: string | null } {
  if (!referrer) return { referrer: null, host: null }
  try {
    const url = new URL(referrer)
    if (!/^https?:$/.test(url.protocol)) return { referrer: null, host: null }
    const host = url.hostname.toLowerCase().replace(/^www\./, "")
    const own = ownHost?.toLowerCase().replace(/^www\./, "")
    if (own && host === own) return { referrer: null, host: null }
    return { referrer: `${host}${url.pathname}`.slice(0, 300), host }
  } catch {
    return { referrer: null, host: null }
  }
}

const PAID_MEDIUM =
  /^(cpc|ppc|paid|paidsearch|paid_search|cpm|cpv|display|ads?)$/
const SOCIAL_MEDIUM = /^(social|social-network|social-media|sm|social_media)$/

export function classifyChannel(host: string | null, utm: Utm): Channel {
  const medium = utm.medium ?? ""
  const source = utm.source ?? ""
  const sourceHost = `${source}.`
  const isSearch = SEARCH.test(`${host ?? ""}.`) || SEARCH.test(sourceHost)
  const isSocial = SOCIAL.test(`${host ?? ""}.`) || SOCIAL.test(sourceHost)

  if (
    /email|e-mail|newsletter/.test(medium) ||
    /newsletter/.test(source) ||
    (host && EMAIL.test(`${host}.`))
  ) {
    return "Email"
  }
  if (PAID_MEDIUM.test(medium) || /^paid/.test(medium)) {
    return isSocial || /social/.test(medium) ? "Paid Social" : "Paid Search"
  }
  if ((host && AI.test(host)) || AI.test(source) || AI.test(`${source}.com`)) {
    return "AI"
  }
  if (utm.ref || /affiliate|partner/.test(medium)) return "Affiliate"
  if (isSearch) return "Organic Search"
  if (isSocial || SOCIAL_MEDIUM.test(medium)) return "Organic Social"
  if (host || source) return "Referral"
  return "Direct"
}
