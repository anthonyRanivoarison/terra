import { BadgeCheck } from "lucide-react"
import { getReferrerIcon } from "@/lib/platform-icons"

const reads = [
  { bot: "GPTBot", host: "openai.com", page: "/pricing", ago: "2m ago" },
  { bot: "ClaudeBot", host: "claude.ai", page: "/docs/api", ago: "6m ago" },
  {
    bot: "PerplexityBot",
    host: "perplexity.ai",
    page: "/blog/launch",
    ago: "11m ago",
  },
  { bot: "Googlebot", host: "google.com", page: "/", ago: "14m ago" },
]

export const AiVisual = () => (
  <figure>
    <figcaption className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">Crawler reads today</span>
      <span className="marketing-accent text-3xl tabular-nums">1,900</span>
    </figcaption>
    <ol className="mt-3 flex flex-col divide-y divide-foreground/10">
      {reads.map((r) => (
        <li key={r.bot} className="flex items-center gap-3 py-2 text-sm">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-foreground/10">
            {getReferrerIcon(r.host, "size-4")}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 font-medium">
              {r.bot}
              <BadgeCheck
                className="size-3.5 text-ring"
                aria-label="Verified"
              />
            </span>
            <span className="truncate text-xs text-muted-foreground">
              read {r.page}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{r.ago}</span>
        </li>
      ))}
    </ol>
  </figure>
)
