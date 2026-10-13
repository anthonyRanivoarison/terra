import { afterEach, describe, expect, it } from "bun:test"
import {
  cidrContains,
  ipInRanges,
  isIp,
  parseCidr,
  parseIp,
  parsePrefixes,
} from "./crawler-ips-cidr"
import { setCrawlerIpFetcher, verifyCrawlerIp } from "./crawler-ips"
import { classifyCrawler } from "./crawlers"

const FIXTURE = {
  creationTime: "2026-10-01T00:00:00.000000",
  prefixes: [
    { ipv4Prefix: "20.171.206.0/24" },
    { ipv4Prefix: "52.230.152.0/28" },
    { ipv6Prefix: "2001:4860:4801:10::/64" },
    { ipv4Prefix: "not-a-cidr" },
  ],
}

const ranges = parsePrefixes(FIXTURE)

describe("parseIp", () => {
  it("accepts v4, v6, compressed and mapped addresses", () => {
    expect(parseIp("66.249.66.1")).toEqual({ v6: false, value: 0x42f94201n })
    expect(parseIp("::1")).toEqual({ v6: true, value: 1n })
    expect(parseIp("::")).toEqual({ v6: true, value: 0n })
    expect(parseIp("::ffff:66.249.66.1")).toEqual(parseIp("66.249.66.1"))
    expect(parseIp("2001:db8::ff00:42:8329")?.v6).toBe(true)
    expect(parseIp("fe80::1%eth0")?.value).toBe((0xfe80n << 112n) | 1n)
  })

  it("rejects malformed input", () => {
    for (const bad of [
      "",
      "1.2.3",
      "256.1.1.1",
      "01.2.3.4",
      "1.2.3.4.5",
      "1::2::3",
      "12345::",
      "1:2:3:4:5:6:7:8:9",
      "1:2:3:4:5:6:7",
      "g::1",
      "localhost",
    ]) {
      expect(isIp(bad)).toBe(false)
    }
  })
})

describe("cidr matching", () => {
  it("parses prefixes and normalises host bits", () => {
    expect(ranges).toHaveLength(3)
    expect(parseCidr("10.1.2.3/8")).toEqual({
      v6: false,
      net: 10n << 24n,
      bits: 8,
    })
    expect(parseCidr("10.0.0.0/33")).toBeNull()
    expect(parseCidr("::/129")).toBeNull()
    expect(parseCidr("0.0.0.0/0")?.bits).toBe(0)
  })

  it("matches ipv4", () => {
    expect(ipInRanges("20.171.206.77", ranges)).toBe(true)
    expect(ipInRanges("52.230.152.15", ranges)).toBe(true)
    expect(ipInRanges("52.230.152.16", ranges)).toBe(false)
    expect(ipInRanges("20.171.207.1", ranges)).toBe(false)
    expect(ipInRanges("::ffff:20.171.206.1", ranges)).toBe(true)
  })

  it("matches ipv6", () => {
    expect(ipInRanges("2001:4860:4801:10::1", ranges)).toBe(true)
    expect(ipInRanges("2001:4860:4801:10:ffff:ffff:ffff:ffff", ranges)).toBe(
      true
    )
    expect(ipInRanges("2001:4860:4801:11::1", ranges)).toBe(false)
    expect(ipInRanges("garbage", ranges)).toBe(false)
  })

  it("never mixes families", () => {
    const all4 = parseCidr("0.0.0.0/0")!
    expect(cidrContains(all4, parseIp("::1")!)).toBe(false)
    expect(cidrContains(all4, parseIp("8.8.8.8")!)).toBe(true)
  })
})

describe("verifyCrawlerIp", () => {
  afterEach(() => setCrawlerIpFetcher(null))

  it("verifies against the published list and caches it", async () => {
    let calls = 0
    setCrawlerIpFetcher(async () => {
      calls += 1
      return Response.json(FIXTURE)
    })
    const gptbot = classifyCrawler("Mozilla/5.0; compatible; GPTBot/1.2")
    expect(await verifyCrawlerIp(gptbot, "20.171.206.9")).toBe(true)
    expect(await verifyCrawlerIp(gptbot, "1.2.3.4")).toBe(false)
    expect(calls).toBe(1)
  })

  it("returns null without a list, an ip or a reachable source", async () => {
    setCrawlerIpFetcher(async () => new Response("nope", { status: 503 }))
    const claude = classifyCrawler("Claude-User/1.0")
    const gptbot = classifyCrawler("GPTBot/1.2")
    expect(await verifyCrawlerIp(claude, "20.171.206.9")).toBeNull()
    expect(await verifyCrawlerIp(gptbot, null)).toBeNull()
    expect(await verifyCrawlerIp(gptbot, "20.171.206.9")).toBeNull()
  })
})
