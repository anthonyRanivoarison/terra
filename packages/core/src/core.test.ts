import { describe, expect, it } from "bun:test"
import { classifyCrawler } from "./crawlers"
import { hostAllowed } from "./hostname"
import { parsePayload } from "./payload"

const SESSION = "3f2504e0-4f89-41d3-9a0c-0305e82c3301"
const VIEW = "6ba7b810-9dad-41d1-80b4-00c04fd430c8"
const base = { websiteId: "ws_abcdef123456", visitorId: "visitor_123456" }

describe("parsePayload", () => {
  it("derives hostname, page and kept query from the url", () => {
    const p = parsePayload({
      ...base,
      type: "pageview",
      sessionId: SESSION,
      viewId: VIEW,
      url: "https://www.docs.launch-now.dev/guide?utm_source=x&token=secret",
    })
    expect(p).toMatchObject({
      location: {
        hostname: "docs.launch-now.dev",
        page: "/guide",
        query: "utm_source=x",
      },
    })
  })

  it("rejects bad website ids, urls and reserved names", () => {
    expect(
      parsePayload({ ...base, websiteId: "dfid_x", type: "event" })
    ).toBeNull()
    expect(
      parsePayload({
        ...base,
        type: "event",
        name: "purchase",
        url: "https://a.dev/",
      })
    ).toBeNull()
    expect(
      parsePayload({
        ...base,
        type: "pageview",
        sessionId: SESSION,
        viewId: VIEW,
        url: "javascript:x",
      })
    ).toBeNull()
  })

  it("clamps pings", () => {
    expect(
      parsePayload({
        ...base,
        type: "ping",
        sessionId: SESSION,
        viewId: VIEW,
        duration: 1e9,
        scroll: 140,
      })
    ).toMatchObject({ duration: 86_400, scroll: 100 })
  })
})

describe("hostAllowed", () => {
  it("accepts the domain and every subdomain only", () => {
    expect(hostAllowed("launch-now.dev", "launch-now.dev")).toBe(true)
    expect(hostAllowed("app.launch-now.dev", "launch-now.dev")).toBe(true)
    expect(hostAllowed("www.launch-now.dev", "launch-now.dev")).toBe(true)
    expect(hostAllowed("evil-launch-now.dev", "launch-now.dev")).toBe(false)
    expect(hostAllowed("launch-now.dev.evil.com", "launch-now.dev")).toBe(false)
    expect(hostAllowed("shop.io", "launch-now.dev", ["shop.io"])).toBe(true)
  })
})

describe("classifyCrawler", () => {
  it.each([
    [
      "Mozilla/5.0 AppleWebKit/537.36; compatible; ChatGPT-User/1.0",
      "answers",
      "OpenAI",
    ],
    [
      "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "training",
      "OpenAI",
    ],
    [
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "training",
      "Anthropic",
    ],
    [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "indexing",
      "Google",
    ],
    ["Mozilla/5.0 (compatible; PerplexityBot/1.0)", "indexing", "Perplexity"],
  ])("%s", (ua, category, company) => {
    expect(classifyCrawler(ua)).toMatchObject({ category, company })
  })

  it("ignores browsers", () => {
    expect(
      classifyCrawler("Mozilla/5.0 (Macintosh) Chrome/140 Safari/537.36")
    ).toBeNull()
  })
})
