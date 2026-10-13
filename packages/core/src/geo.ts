import geoip from "geoip-lite"
import maxmind, { type AsnResponse, type Reader } from "maxmind"
import { getClientIp } from "./client-ip"

export type GeoInfo = {
  country: string | null
  city: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  asn: number | null
  asOrg: string | null
}

let _asnReader: Promise<Reader<AsnResponse> | null> | null = null

function asnReader() {
  const path = process.env.ASN_DB_PATH
  if (!path) return Promise.resolve(null)
  _asnReader ??= maxmind.open<AsnResponse>(path).catch((e) => {
    console.warn("[geo] ASN database unavailable:", (e as Error).message)
    return null
  })
  return _asnReader
}

async function lookupAsn(ip: string | null) {
  if (!ip) return { asn: null, asOrg: null }
  try {
    const hit = (await asnReader())?.get(ip)
    return {
      asn: hit?.autonomous_system_number ?? null,
      asOrg: hit?.autonomous_system_organization ?? null,
    }
  } catch {
    return { asn: null, asOrg: null }
  }
}

function lookupOffline(ip: string | null) {
  if (!ip) return null
  try {
    return geoip.lookup(ip)
  } catch {
    return null
  }
}

function decode(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function coord(value: string | number | null | undefined): number | null {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  if (n == null || !Number.isFinite(n)) return null
  return Math.round(n * 10) / 10
}

export async function resolveGeo(request: Request): Promise<GeoInfo> {
  const h = request.headers
  const ip = getClientIp(request)
  const offline = lookupOffline(ip)
  const { asn, asOrg } = await lookupAsn(ip)

  const vercelLat = coord(h.get("x-vercel-ip-latitude"))
  const vercelLon = coord(h.get("x-vercel-ip-longitude"))
  const hasVercelCoords = vercelLat != null && vercelLon != null

  return {
    country:
      h.get("x-geo-country") ||
      h.get("cf-ipcountry")?.replace(/^(XX|T1)$/, "") ||
      h.get("x-vercel-ip-country") ||
      offline?.country ||
      null,
    city:
      decode(h.get("x-geo-city") || h.get("x-vercel-ip-city")) ||
      offline?.city ||
      null,
    region: h.get("x-vercel-ip-country-region") || offline?.region || null,
    latitude: hasVercelCoords ? vercelLat : coord(offline?.ll?.[0]),
    longitude: hasVercelCoords ? vercelLon : coord(offline?.ll?.[1]),
    timezone: h.get("x-vercel-ip-timezone") || offline?.timezone || null,
    asn,
    asOrg,
  }
}
