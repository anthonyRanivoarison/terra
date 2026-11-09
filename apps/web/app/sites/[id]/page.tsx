import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SetupNav } from "@/components/app/setup-nav"
import { AgentSetup } from "@/components/setup/agent-setup"
import { InstallManual } from "@/components/setup/install-manual"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import { InstallStatus } from "@/components/sites/install-status"
import { SiteFavicon } from "@/components/sites/site-favicon"
import { installPrompt } from "@/lib/agent-prompt"
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
  const install = {
    domain: site.domain,
    publicId: site.publicId,
    ingestUrl: ingestUrl(),
    botToken: site.botToken,
  }

  return (
    <PageShell>
      <Toolbar />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2 pb-12">
        <SetupNav
          current={1}
          revenueHref={`/sites/${site.publicId}/settings/revenue`}
        />
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
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
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Install Terra</h2>
            <p className="text-sm text-muted-foreground">
              Let your coding agent add the script, your goals and AI crawler
              tracking, or paste the snippets yourself.
            </p>
          </div>
          <AgentSetup
            prompt={installPrompt(install)}
            promptNote="It includes your bot token, so only paste it in an agent you trust."
            manual={<InstallManual {...install} />}
          />
        </section>
      </div>
    </PageShell>
  )
}
