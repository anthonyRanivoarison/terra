export const DAYS = [
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Today",
]

export const VISITORS = [
  3120, 3290, 3480, 3360, 2780, 2610, 3450, 3700, 3820, 3610, 2950, 2840, 3980,
  5220,
]

export const REVENUE = [
  5240, 5810, 6420, 6180, 4630, 4210, 6390, 6870, 7240, 6650, 5120, 4980, 7460,
  9140,
]

export const DEMO_CHANNELS = [
  { name: "Google", visitors: 18420, revenue: 31280 },
  { name: "ChatGPT", visitors: 6140, revenue: 22960 },
  { name: "Newsletter", visitors: 4380, revenue: 14720 },
  { name: "Direct", visitors: 7210, revenue: 9870 },
  { name: "X", visitors: 9860, revenue: 5410 },
  { name: "Perplexity", visitors: 2200, revenue: 2100 },
]

export const DEMO_CRAWLERS = [
  { name: "Googlebot", reads: 1204 },
  { name: "GPTBot", reads: 412 },
  { name: "ClaudeBot", reads: 188 },
  { name: "PerplexityBot", reads: 96 },
]

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0)

export const TOTALS = {
  visitors: sum(VISITORS),
  revenue: sum(REVENUE),
  orders: 1162,
}

export const formatCount = (value: number) => value.toLocaleString("en-US")

export const formatMoney = (value: number) =>
  `$${Math.round(value).toLocaleString("en-US")}`

export const formatRate = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
