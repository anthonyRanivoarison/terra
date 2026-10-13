import type { VisitRow } from "@/lib/analytics/sessions"
import { countryName } from "@/lib/country"
import { DimensionIcon } from "../dimension-icon"

export const place = (v: VisitRow): string =>
  [v.city, v.country && countryName(v.country)].filter(Boolean).join(", ") ||
  "Unknown location"

type VisitMetaType = { visit: VisitRow }

export const VisitMeta = ({ visit }: VisitMetaType) => (
  <span className="flex min-w-0 items-center gap-2">
    <DimensionIcon kind="country" value={visit.country ?? ""} />
    <span className="min-w-0 truncate">
      <span className="font-medium">{place(visit)}</span>
      <span className="text-muted-foreground">
        {" "}
        · {[visit.browser, visit.os, visit.device].filter(Boolean).join(" · ")}
      </span>
    </span>
  </span>
)
