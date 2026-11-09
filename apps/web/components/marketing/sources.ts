export type Source = { name: string; host: string; ai: boolean }

export const SOURCES: Source[] = [
  { name: "Google", host: "google.com", ai: false },
  { name: "ChatGPT", host: "chatgpt.com", ai: true },
  { name: "X", host: "x.com", ai: false },
  { name: "Perplexity", host: "perplexity.ai", ai: true },
  { name: "LinkedIn", host: "linkedin.com", ai: false },
  { name: "Claude", host: "claude.ai", ai: true },
  { name: "Reddit", host: "reddit.com", ai: false },
  { name: "Direct", host: "Direct", ai: false },
]

export const hostOf = (channel: string) =>
  SOURCES.find((s) => s.name === channel)?.host ?? "Direct"
