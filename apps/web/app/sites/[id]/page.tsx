import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AppHeader } from "@/components/app/app-header"
import { SetupNav } from "@/components/app/setup-nav"
import { BotTrackingSnippet } from "@/components/sites/bot-tracking-snippet"
import { InstallStatus } from "@/components/sites/install-status"
import { SiteFavicon } from "@/components/sites/site-favicon"
import { Snippet } from "@/components/sites/snippet"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export const metadata: Metadata = { title: "Install" }

const ingestUrl = () =>
  (process.env.NEXT_PUBLIC_INGEST_URL ?? "http://localhost:4000").replace(
    /\/$/,
    ""
  )

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const organizationId = await requireOrganization()
  const site = await getSite(organizationId, (await params).id)
  if (!site) notFound()

  const script = `<script
  defer
  data-website-id="${site.publicId}"
  data-domain="${site.domain}"
  src="${ingestUrl()}/js/script.js">
</script>`
  const goal = `<button data-goal="signup" data-goal-plan="pro">Sign up</button>
<script>window.terra?.goal("signup", { plan: "pro" })</script>`

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 pt-6 pb-12">
        <SetupNav
          current={1}
          revenueHref={`/sites/${site.publicId}/settings/revenue`}
        />
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 font-heading text-3xl font-semibold tracking-tight">
            <SiteFavicon
              siteId={site.publicId}
              domain={site.domain}
              className="size-6 rounded-md"
            />
            {site.name}
          </h1>
          <p className="text-sm text-muted-foreground">{site.domain}</p>
          <Link
            href={`/sites/${site.publicId}/dashboard`}
            className="w-fit text-sm font-medium underline-offset-4 hover:underline"
          >
            Open dashboard →
          </Link>
        </div>
        <InstallStatus
          siteId={site.publicId}
          domain={site.domain}
          live={site.firstEventAt !== null}
        />
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">
            Tracking script
          </h2>
          <p className="text-sm text-muted-foreground">
            Add it to the head of every page. All subdomains of {site.domain}{" "}
            share the same visitors and visits.
          </p>
          <Snippet code={script} label="tracking script" />
        </section>
        <section className="flex flex-col gap-3">
          <h2
            id="goals"
            className="scroll-mt-20 font-heading text-lg font-semibold"
          >
            Goals
          </h2>
          <p className="text-sm text-muted-foreground">
            Clicks and outbound links are tracked automatically. Name the ones
            that matter with an attribute, or from code.
          </p>
          <Snippet code={goal} label="goal examples" />
        </section>
        <BotTrackingSnippet
          websiteId={site.publicId}
          token={site.botToken}
          ingestUrl={ingestUrl()}
        />
      </main>
    </>
  )
}
