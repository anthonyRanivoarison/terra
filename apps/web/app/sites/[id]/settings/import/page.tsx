import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ImportForm } from "@/components/imports/import-form"
import { ImportList } from "@/components/imports/import-list"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import { listImports } from "@/lib/imports/store"
import { siteConfig } from "@/lib/seo"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export const metadata: Metadata = { title: "Import" }

export default async function ImportSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const organizationId = await requireOrganization()
  const site = await getSite(organizationId, (await params).id)
  if (!site) notFound()
  const imports = await listImports(site.id)

  return (
    <PageShell>
      <Toolbar title="Import data" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2 pb-12">
        <div className="flex flex-col gap-2">
          <Link
            href={`/sites/${site.publicId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {site.name}
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">
            Bring your history
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            Keep the traffic you collected with another tool. Imported days show
            in the overview, the chart and the pages, sources, location and
            device reports of {site.domain}. Days after Terra recorded its first
            visit are ignored, so nothing is counted twice. Sessions, funnels,
            revenue and filters only use data Terra collected itself.
          </p>
        </div>
        <ImportForm
          publicId={site.publicId}
          guide={`${siteConfig.github}/blob/main/docs/import.md`}
        />
        <ImportList
          publicId={site.publicId}
          imports={imports.map(({ createdAt, ...item }) => item)}
        />
      </div>
    </PageShell>
  )
}
