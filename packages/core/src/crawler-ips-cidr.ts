export type ParsedIp = { v6: boolean; value: bigint }

export type Cidr = { v6: boolean; net: bigint; bits: number }

const V4_PART = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const HEXTET = /^[0-9a-f]{1,4}$/i

function parseV4(ip: string): bigint | null {
  const parts = ip.split(".")
  if (parts.length !== 4) return null
  let value = 0n
  for (const part of parts) {
    if (!V4_PART.test(part)) return null
    value = (value << 8n) | BigInt(part)
  }
  return value
}

function hextets(text: string): number[] | null {
  if (text === "") return []
  const out: number[] = []
  const parts = text.split(":")
  for (const [i, part] of parts.entries()) {
    if (i === parts.length - 1 && part.includes(".")) {
      const v4 = parseV4(part)
      if (v4 === null) return null
      out.push(Number(v4 >> 16n), Number(v4 & 0xffffn))
    } else if (HEXTET.test(part)) {
      out.push(parseInt(part, 16))
    } else {
      return null
    }
  }
  return out
}

function parseV6(raw: string): bigint | null {
  const ip = raw.replace(/^\[|\]$/g, "").split("%")[0] ?? ""
  const halves = ip.split("::")
  if (halves.length > 2) return null
  const head = hextets(halves[0] ?? "")
  const tail = halves.length === 2 ? hextets(halves[1] ?? "") : []
  if (!head || !tail) return null
  const missing = 8 - head.length - tail.length
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null
  const all = [...head, ...Array<number>(missing).fill(0), ...tail]
  return all.reduce((acc, h) => (acc << 16n) | BigInt(h), 0n)
}

const MAPPED = 0xffffn << 32n

export function parseIp(input: string): ParsedIp | null {
  const ip = input.trim()
  if (!ip || ip.length > 64) return null
  if (!ip.includes(":")) {
    const v4 = parseV4(ip)
    return v4 === null ? null : { v6: false, value: v4 }
  }
  const v6 = parseV6(ip)
  if (v6 === null) return null
  if (v6 >> 32n === 0xffffn) return { v6: false, value: v6 ^ MAPPED }
  return { v6: true, value: v6 }
}

export function isIp(input: unknown): input is string {
  return typeof input === "string" && parseIp(input) !== null
}

export function parseCidr(input: string): Cidr | null {
  const [address, prefix, extra] = input.trim().split("/")
  if (!address || extra !== undefined) return null
  const ip = parseIp(address)
  if (!ip) return null
  const size = ip.v6 ? 128 : 32
  const bits = prefix === undefined ? size : Number(prefix)
  if (!Number.isInteger(bits) || bits < 0 || bits > size) return null
  const shift = BigInt(size - bits)
  return { v6: ip.v6, net: (ip.value >> shift) << shift, bits }
}

export function cidrContains(cidr: Cidr, ip: ParsedIp): boolean {
  if (cidr.v6 !== ip.v6) return false
  const shift = BigInt((cidr.v6 ? 128 : 32) - cidr.bits)
  return ip.value >> shift === cidr.net >> shift
}

export function ipInRanges(ip: string, ranges: readonly Cidr[]): boolean {
  const parsed = parseIp(ip)
  return parsed !== null && ranges.some((cidr) => cidrContains(cidr, parsed))
}

export function parsePrefixes(json: unknown): Cidr[] {
  const prefixes = (json as { prefixes?: unknown } | null)?.prefixes
  if (!Array.isArray(prefixes)) return []
  const out: Cidr[] = []
  for (const entry of prefixes) {
    const e = entry as { ipv4Prefix?: unknown; ipv6Prefix?: unknown } | null
    const raw = e?.ipv4Prefix ?? e?.ipv6Prefix
    const cidr = typeof raw === "string" ? parseCidr(raw) : null
    if (cidr) out.push(cidr)
  }
  return out
}
