export type Chapter = {
  id: string
  name: string
  title: string
  body: string
}

export const chapters: Chapter[] = [
  {
    id: "traffic",
    name: "Traffic",
    title: "Every visit, from every city.",
    body: "One script on your site and each pageview arrives with its source, page and country. No third-party cookies, no consent banner for them.",
  },
  {
    id: "revenue",
    name: "Revenue",
    title: "Then the sales light up.",
    body: "Connect Paddle and every payment joins the visit that brought it, first or last touch, refunds taken off. The channels that only send traffic go quiet.",
  },
  {
    id: "live",
    name: "Live",
    title: "Who is on the site right now.",
    body: "City, page, source and time on site for everyone online, refreshed every few seconds. Each visit keeps its full timeline of pages and events.",
  },
  {
    id: "ai",
    name: "AI",
    title: "Assistants read you too.",
    body: "ChatGPT, Claude and Perplexity send visitors and crawl your pages. Terra counts both, and checks each crawler against the IP ranges its operator publishes.",
  },
]
