import { UAParser } from "ua-parser-js"
import { isbot, isbotMatch } from "isbot"

export function detectBotName(ua: string): string | null {
  if (!isbot(ua)) return null
  const m = ua.match(
    /([A-Za-z0-9][A-Za-z0-9._-]*(?:bot|crawler|spider|slurp|curl|wget|python|scrapy|headless)[A-Za-z0-9._-]*)/i
  )
  let name = (m?.[1] ?? isbotMatch(ua)) || "Bot"
  name = name.replace(/\/[\d.]+$/, "")
  return name
}

const GENERIC_BRANDS = /^(chromium|google chrome)$|not.?a.?brand/i
const BRAND_NAMES: Record<string, string> = { "google chrome": "Chrome" }

export function brandFromClientHints(secChUa: string | null): string | null {
  if (!secChUa) return null
  const brands = [...secChUa.matchAll(/"([^"]+)"\s*;\s*v=/g)].flatMap((m) =>
    m[1] ? [m[1]] : []
  )
  const specific = brands.find((b) => !GENERIC_BRANDS.test(b))
  if (specific) return BRAND_NAMES[specific.toLowerCase()] ?? specific
  return null
}

export function parseUA(ua: string, secChUa: string | null = null) {
  const botName = detectBotName(ua)
  const parser = new UAParser(ua)

  const browser =
    botName ??
    brandFromClientHints(secChUa) ??
    parser.getBrowser().name ??
    "Unknown"
  const os = parser.getOS().name ?? "Unknown"

  const deviceType = parser.getDevice().type
  const device = botName
    ? "Bot"
    : deviceType === "mobile"
      ? "Mobile"
      : deviceType === "tablet"
        ? "Tablet"
        : "Desktop"

  return { browser, os, device, isBot: botName !== null, botName }
}

export type ClientDetails = {
  browserVersion: string | null
  osVersion: string | null
  deviceVendor: string | null
  deviceModel: string | null
  cpuArch: string | null
  cpuCores: number | null
  memoryGb: number | null
  screen: string | null
  viewport: string | null
  language: string | null
  connection: string | null
}

const str = (v: unknown, max = 64): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null

const dims = (v: unknown): string | null => {
  const s = str(v, 32)
  return s && /^\d{2,5}×\d{2,5}(@[\d.]+x)?$/.test(s) ? s : null
}

const num = (v: unknown, min: number, max: number): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null

function osVersionFromHints(
  os: string,
  platformVersion: string | null
): string | null {
  if (!platformVersion) return null
  const [major, minor] = platformVersion.split(".").map(Number)
  if (/windows/i.test(os)) {
    if (major === undefined || !Number.isFinite(major) || major === 0) {
      return null
    }
    return major >= 13 ? "11" : "10"
  }
  if (/mac/i.test(os) && Number.isFinite(major)) {
    return minor ? `${major}.${minor}` : String(major)
  }
  return platformVersion
}

export function describeClient(
  ua: string,
  browser: string,
  client: unknown
): ClientDetails {
  const parser = new UAParser(ua)
  const c = (client && typeof client === "object" ? client : {}) as Record<
    string,
    unknown
  >
  const hints = (
    c.hints && typeof c.hints === "object" ? c.hints : {}
  ) as Record<string, unknown>

  const os = parser.getOS()
  const device = parser.getDevice()

  const brandVersion = Array.isArray(hints.fullVersionList)
    ? (hints.fullVersionList as { brand?: unknown; version?: unknown }[]).find(
        (b) =>
          typeof b.brand === "string" &&
          b.brand.toLowerCase().includes(browser.toLowerCase())
      )?.version
    : null

  const arch = str(hints.architecture, 16)
  const bitness = str(hints.bitness, 4)

  return {
    browserVersion:
      str(brandVersion, 32) ?? str(parser.getBrowser().version, 32),
    osVersion:
      osVersionFromHints(os.name ?? "", str(hints.platformVersion, 32)) ??
      str(os.version, 32),
    deviceVendor: str(device.vendor, 32),
    deviceModel: str(hints.model, 64) ?? str(device.model, 64),
    cpuArch: arch
      ? `${arch}${bitness ? `-${bitness}` : ""}`
      : str(parser.getCPU().architecture, 16),
    cpuCores: num(c.cpuCores, 1, 512),
    memoryGb: num(c.memoryGb, 0.25, 1024),
    screen: dims(c.screen),
    viewport: dims(c.viewport),
    language: str(c.language, 35),
    connection: str(c.connection, 16),
  }
}
