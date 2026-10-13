import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckoutSnippets } from "@/components/revenue/checkout-snippets"
import { ConnectForm } from "@/components/revenue/connect-form"
import { ConnectionStatus } from "@/components/revenue/connection-status"
import { getConnection } from "@/lib/revenue/store"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export const metadata: Metadata = { title: "Revenue" }

export default async function RevenueSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const organizationId = await requireOrganization()
  const site = await getSite(organizationId, (await params).id)
  if (!site) notFound()
  const connection = await getConnection(site.id)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href={`/sites/${site.publicId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {site.name}
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Revenue
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect Paddle to see which channels, pages and campaigns bring paying
          customers to {site.domain}.
        </p>
      </div>
      {connection ? (
        <ConnectionStatus
          publicId={site.publicId}
          environment={connection.environment}
          connectedAt={connection.connectedAt.toISOString()}
          lastBackfillAt={connection.lastBackfillAt?.toISOString() ?? null}
        />
      ) : (
        <ConnectForm publicId={site.publicId} />
      )}
      <CheckoutSnippets />
    </main>
  )
}
