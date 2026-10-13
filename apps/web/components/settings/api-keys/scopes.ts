import type { Scope } from "@/lib/api/keys"

export const SCOPE_LABELS: { value: Scope; description: string }[] = [
  {
    value: "read:stats",
    description: "Read sites, stats, visits and realtime",
  },
  { value: "write:events", description: "Send server-side goals" },
  { value: "write:payments", description: "Record payments and refunds" },
]
