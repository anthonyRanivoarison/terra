import { DimensionIcon } from "@/components/dashboard/dimension-icon"
import { VisitorAvatar } from "@/components/visitor/avatar"
import { visitorName } from "@/components/visitor/identity"
import { RowIcon } from "./row-icon"

const visitors = [
  {
    id: "v-2041",
    country: "FR",
    page: "/pricing",
    source: "ChatGPT",
    time: "12s",
  },
  {
    id: "v-7730",
    country: "US",
    page: "/docs/install",
    source: "Google",
    time: "48s",
  },
  { id: "v-5512", country: "MG", page: "/", source: "Direct", time: "1m 5s" },
  {
    id: "v-9184",
    country: "DE",
    page: "/blog/launch",
    source: "X",
    time: "2m 10s",
  },
]

export const LiveVisual = () => (
  <figure>
    <figcaption className="flex items-baseline justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-up" aria-hidden />
        Online now
      </span>
      <span className="marketing-accent text-3xl tabular-nums">27</span>
    </figcaption>
    <ul className="mt-3 flex flex-col gap-2.5">
      {visitors.map((v) => (
        <li key={v.id} className="flex items-center gap-3 text-sm">
          <span className="relative shrink-0">
            <VisitorAvatar id={v.id} className="size-9" />
            <DimensionIcon
              kind="country"
              value={v.country}
              className="absolute -right-1 -bottom-1 size-4 ring-2 ring-card"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-medium">{visitorName(v.id)}</span>
            <span className="truncate text-xs text-muted-foreground">
              {v.page}
            </span>
          </span>
          <RowIcon channel={v.source} />
          <span className="w-12 text-right text-xs text-up tabular-nums">
            {v.time}
          </span>
        </li>
      ))}
    </ul>
  </figure>
)
