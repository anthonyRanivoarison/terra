import { describe, expect, it } from "bun:test"
import {
  type Channel,
  classifyChannel,
  keepQuery,
  parseReferrer,
  parseUtm,
} from "./attribution"

const channel = (referrer: string | null, query: string | null = null) =>
  classifyChannel(
    parseReferrer(referrer, "launch-now.dev").host,
    parseUtm(query)
  )

describe("parseReferrer", () => {
  it("keeps the host and path without www", () => {
    expect(parseReferrer("https://www.google.com/search?q=x", null)).toEqual({
      referrer: "google.com/search",
      host: "google.com",
    })
  })

  it("drops self referrals and junk", () => {
    expect(
      parseReferrer("https://www.launch-now.dev/#pricing", "launch-now.dev")
        .host
    ).toBeNull()
    expect(parseReferrer("android-app://com.slack", null).host).toBeNull()
    expect(parseReferrer("not a url", null).host).toBeNull()
  })
})

describe("keepQuery", () => {
  it("keeps only campaign parameters", () => {
    expect(keepQuery("?utm_source=x&email=a@b.c&ref=bob&token=1")).toBe(
      "utm_source=x&ref=bob"
    )
    expect(keepQuery("?token=1")).toBeNull()
  })
})

describe("classifyChannel", () => {
  it.each([
    [null, null, "Direct"],
    ["https://www.google.com/", null, "Organic Search"],
    ["https://duckduckgo.com/", null, "Organic Search"],
    ["https://www.google.com/", "utm_medium=cpc", "Paid Search"],
    ["https://t.co/abc", null, "Organic Social"],
    ["https://x.com/someone", null, "Organic Social"],
    ["https://www.linkedin.com/feed", null, "Organic Social"],
    ["https://news.ycombinator.com/item", null, "Organic Social"],
    [null, "utm_source=facebook&utm_medium=paid", "Paid Social"],
    ["https://chatgpt.com/", null, "AI"],
    [null, "utm_source=chatgpt.com", "AI"],
    ["https://www.perplexity.ai/", null, "AI"],
    ["https://claude.ai/", null, "AI"],
    [null, "utm_medium=email&utm_source=newsletter", "Email"],
    ["https://mail.google.com/", null, "Email"],
    [null, "ref=bob", "Affiliate"],
    ["https://some-blog.dev/post", null, "Referral"],
    ["https://dev.example.com/", null, "Referral"],
  ])("%s + %s → %s", (referrer, query, expected) => {
    expect(channel(referrer, query)).toBe(expected as Channel)
  })
})
