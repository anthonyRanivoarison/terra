export const IMPORT_SOURCES = [
  { value: "plausible", label: "Plausible" },
  { value: "umami", label: "Umami" },
  { value: "ga4", label: "Google Analytics 4" },
  { value: "vercel", label: "Vercel Web Analytics" },
  { value: "csv", label: "Other CSV" },
]

export const sourceLabel = (value: string) =>
  IMPORT_SOURCES.find((source) => source.value === value)?.label ?? value
