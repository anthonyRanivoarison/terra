import Link from "next/link"
import { ArrowUpRightIcon, CircleNotchIcon } from "@phosphor-icons/react/ssr"
import { Delta } from "@/components/dashboard/delta"
import { formatMoney, formatNumber } from "@/components/dashboard/format"
import { SiteFavicon } from "@/components/sites/site-favicon"
import type { SiteOverview } from "@/lib/sites-overview"
import type { SiteSummary } from "@/lib/sites"
import { Sparkline } from "@/components/charts/sparkline"

type SitePanelType = { site: SiteSummary; overview: SiteOverview }

type StatType = { label: string; children: React.ReactNode }

const Stat = ({ label, children }: StatType) => (
  <div className="flex min-w-0 flex-col gap-1">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 items-center gap-1.5 text-sm font-semibold tabular-nums">
      {children}
    </dd>
  </div>
)

export const SitePanel = ({ site, overview }: SitePanelType) => {
  const live = site.firstEventAt !== null
  const dashboard = `/sites/${site.publicId}/dashboard`

  return (
    <article className="group relative flex w-full flex-col gap-5 rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
            <SiteFavicon
              siteId={site.publicId}
              domain={site.domain}
              className="size-5"
            />
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-base font-semibold">
              <Link
                href={live ? dashboard : `/sites/${site.publicId}`}
                className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {site.name}
              </Link>
            </h2>
            <span className="truncate text-sm text-muted-foreground">
              {site.domain}
            </span>
          </div>
        </div>
        {live ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-up">
            <span className="relative flex size-1.5">
              {overview.online > 0 && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
              )}
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            {overview.online} online
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
            <CircleNotchIcon
              className="size-3 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            Waiting
          </span>
        )}
      </header>

      {live ? (
        <>
          <Sparkline
            values={overview.daily}
            label={`${site.name}: visitors over the last 30 days`}
            dot
          />
          <dl className="grid grid-cols-3 gap-3 border-t pt-4">
            <Stat label="Visitors · 7d">
              {formatNumber(overview.visitors)}
              <Delta
                current={overview.visitors}
                previous={overview.previousVisitors}
              />
            </Stat>
            <Stat label="Revenue · 7d">
              {formatMoney(overview.revenueCents)}
            </Stat>
            <Stat label="Top source">
              <span className="truncate font-medium">
                {overview.topSource ?? "—"}
              </span>
            </Stat>
          </dl>
        </>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-4 rounded-lg border border-dashed p-4">
          <p className="text-sm text-pretty text-muted-foreground">
            Awaiting the first event. Paste the script on {site.domain} and
            visit it once.
          </p>
          <span className="relative z-10 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary">
            Install the script
            <ArrowUpRightIcon
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
        </div>
      )}
    </article>
  )
}
