export type ChannelId = "google" | "chatgpt" | "x" | "newsletter"

export type Arc = {
  country: string
  lat: number
  lon: number
  channel: ChannelId
  amount?: number
}

export type Crawler = {
  id: string
  name: string
  radius: number
  tilt: number
  node: number
  speed: number
  phase: number
}

export const HUB = { lat: 52.37, lon: 4.9 }

export const CHANNELS: { id: ChannelId; name: string; arc: number }[] = [
  { id: "google", name: "Google", arc: 0 },
  { id: "chatgpt", name: "ChatGPT", arc: 6 },
  { id: "x", name: "X", arc: 1 },
  { id: "newsletter", name: "Newsletter", arc: 11 },
]

export const channelName = (id: ChannelId) =>
  CHANNELS.find((channel) => channel.id === id)?.name ?? id

export const ARCS: Arc[] = [
  {
    country: "United States",
    lat: 38.9,
    lon: -77,
    channel: "google",
    amount: 249,
  },
  { country: "Brazil", lat: -23.5, lon: -46.6, channel: "x" },
  {
    country: "Canada",
    lat: 45.5,
    lon: -73.6,
    channel: "newsletter",
    amount: 129,
  },
  { country: "United Kingdom", lat: 53.5, lon: -2.2, channel: "chatgpt" },
  { country: "Spain", lat: 40.4, lon: -3.7, channel: "google" },
  { country: "Sweden", lat: 59.3, lon: 18.1, channel: "x" },
  { country: "India", lat: 19.1, lon: 72.9, channel: "chatgpt", amount: 89 },
  { country: "Japan", lat: 35.7, lon: 139.7, channel: "google" },
  { country: "Singapore", lat: 1.35, lon: 103.8, channel: "chatgpt" },
  { country: "Australia", lat: -33.9, lon: 151.2, channel: "x" },
  { country: "Nigeria", lat: 6.5, lon: 3.4, channel: "google" },
  { country: "South Africa", lat: -26.2, lon: 28, channel: "newsletter" },
  { country: "Mexico", lat: 19.4, lon: -99.1, channel: "chatgpt" },
  {
    country: "United States",
    lat: 37.8,
    lon: -122.4,
    channel: "chatgpt",
    amount: 499,
  },
  { country: "Argentina", lat: -34.6, lon: -58.4, channel: "google" },
  { country: "United Arab Emirates", lat: 25.2, lon: 55.3, channel: "x" },
]

export const CRAWLERS: Crawler[] = [
  {
    id: "gptbot",
    name: "GPTBot",
    radius: 2.6,
    tilt: 0.5,
    node: 0.3,
    speed: 0.32,
    phase: 0,
  },
  {
    id: "claudebot",
    name: "ClaudeBot",
    radius: 2.78,
    tilt: 1.1,
    node: 1.8,
    speed: 0.26,
    phase: 1.7,
  },
  {
    id: "perplexitybot",
    name: "PerplexityBot",
    radius: 2.94,
    tilt: 0.25,
    node: 3.6,
    speed: 0.22,
    phase: 3.1,
  },
  {
    id: "googlebot",
    name: "Googlebot",
    radius: 3.1,
    tilt: 1.45,
    node: 5,
    speed: 0.18,
    phase: 4.4,
  },
]

export type Chapter = {
  id: string
  title: string
  body: string
  facts: { label: string; value: string }[]
  side: "start" | "end"
}

export const CHAPTERS: Chapter[] = [
  {
    id: "sources",
    title: "Every visit carries its source.",
    body: "Referrers, UTM tags and AI assistants are read the moment a visitor lands. Google, ChatGPT, X and your newsletter each get their own line instead of one vague “direct”.",
    facts: [
      { label: "Read on arrival", value: "Referrer, UTM, AI" },
      { label: "Grouped into", value: "Channels and campaigns" },
    ],
    side: "start",
  },
  {
    id: "revenue",
    title: "Follow the money back to the click.",
    body: "Each purchase is matched to the visit that started it. Compare revenue by channel, page and country, with first touch and last touch side by side.",
    facts: [
      { label: "Attribution", value: "First and last touch" },
      { label: "Broken down by", value: "Channel, page, country" },
    ],
    side: "end",
  },
  {
    id: "ai",
    title: "See when AI reads your pages.",
    body: "ChatGPT, Claude, Perplexity and Google send crawlers to read your site before they answer questions about it. Terra logs each read, and the people who arrive from those answers.",
    facts: [
      { label: "Crawlers", value: "GPTBot, ClaudeBot, more" },
      { label: "Referrals", value: "Tracked as AI traffic" },
    ],
    side: "start",
  },
]

export const mulberry32 = (seed: number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
