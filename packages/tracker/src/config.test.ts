import { beforeAll, describe, expect, it } from "bun:test"
import { Window } from "happy-dom"
import { readConfig, shouldTrack, type Config } from "./config"

const page = new Window({ url: "https://blog.example.com/post" })

beforeAll(() => {
  Object.assign(globalThis, {
    location: page.location,
    navigator: { webdriver: false },
  })
})

const script = (data: Record<string, string>) => {
  const el = page.document.createElement("script")
  el.src = "https://ingest.example.com/js/script.js"
  for (const [key, value] of Object.entries(data)) el.dataset[key] = value
  return el as unknown as HTMLScriptElement
}

const config = (domain: string): Config => ({
  websiteId: "ws_1",
  domain,
  endpoint: "https://ingest.example.com/api/event",
  allowLocalhost: false,
  debug: false,
})

describe("readConfig", () => {
  it("needs a website id", () => {
    expect(readConfig(null)).toBeNull()
    expect(readConfig(script({}))).toBeNull()
  })

  it("posts to the script origin unless an api is given", () => {
    expect(readConfig(script({ websiteId: "ws_1" }))).toMatchObject({
      websiteId: "ws_1",
      domain: "blog.example.com",
      endpoint: "https://ingest.example.com/api/event",
    })
    expect(
      readConfig(script({ websiteId: "ws_1", api: "https://t.example.com/" }))
        ?.endpoint
    ).toBe("https://t.example.com/api/event")
  })

  it("drops www from the domain", () => {
    expect(
      readConfig(script({ websiteId: "ws_1", domain: "www.example.com" }))
        ?.domain
    ).toBe("example.com")
  })
})

describe("shouldTrack", () => {
  it("tracks the domain and its subdomains only", () => {
    expect(shouldTrack(config("example.com"))).toBe(true)
    expect(shouldTrack(config("other.com"))).toBe(false)
  })
})
