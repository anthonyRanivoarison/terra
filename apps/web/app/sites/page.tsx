import type { Metadata } from "next"
import Link from "next/link"
import { GlobeIcon, PlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { PortfolioSummary } from "@/components/sites/overview/portfolio-summary"
import { SitePanel } from "@/components/sites/overview/site-panel"
import { requireOrganization } from "@/lib/session"
import { listSites } from "@/lib/sites"
import { getSitesOverview } from "@/lib/sites-overview"

export const metadata: Metadata = { title: "Sites" }

export default async function SitesPage() {
  const sites = await listSites(await requireOrganization())
  const overviews = await getSitesOverview(sites.map((site) => site.id))
  const liveCount = sites.filter((site) => site.firstEventAt).length
  const add = (
    <Button nativeButton={false} render={<Link href="/sites/new" />}>
      <PlusIcon aria-hidden />
      Add site
    </Button>
  )

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SidebarTrigger className="-ms-1.5 mb-2 md:hidden" />
            <h1 className="text-3xl font-semibold tracking-tight">Sites</h1>
            {sites.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Traffic and revenue across your {sites.length}{" "}
                {sites.length === 1 ? "site" : "sites"}, last 7 days
              </p>
            )}
          </div>
          {sites.length > 0 && add}
        </div>
        {sites.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GlobeIcon aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No sites yet</EmptyTitle>
              <EmptyDescription>
                Add your first site to get a tracking script.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{add}</EmptyContent>
          </Empty>
        ) : (
          <>
            <PortfolioSummary
              overviews={Object.values(overviews)}
              liveCount={liveCount}
              total={sites.length}
            />
            <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
              {sites.map((site) => (
                <li key={site.id} className="flex">
                  <SitePanel site={site} overview={overviews[site.id]!} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  )
}
