export const SAMPLE_BUCKETS = [7, 8, 9, 10, 11, 12, 13].map(
  (day) => `2026-06-${String(day).padStart(2, "0")}T00:00`
)

export const SAMPLE_CRAWLERS = [
  {
    key: "chatgpt-user",
    label: "ChatGPT",
    values: [28, 31, 35, 30, 37, 33, 32],
  },
  { key: "vertex", label: "Gemini", values: [1, 2, 1, 1, 2, 1, 1] },
  { key: "claude-user", label: "Claude", values: [0, 1, 0, 0, 0, 1, 0] },
  {
    key: "perplexity-user",
    label: "Perplexity",
    values: [0, 0, 1, 0, 0, 0, 1],
  },
]

export const sampleTotal = (values: number[]) =>
  values.reduce((sum, v) => sum + v, 0)

export const SAMPLE_PAGES = [
  { path: "/", hits: 612 },
  { path: "/docs", hits: 341 },
  { path: "/pricing", hits: 208 },
  { path: "/blog/ai-search-traffic", hits: 117 },
  { path: "/blog/llms-txt", hits: 84 },
]
