import { notFound } from "next/navigation"
import { VisitDetail } from "@/components/dashboard/sessions/visit-detail"
import { VisitMeta } from "@/components/dashboard/sessions/visit-meta"
import { VisitSheet } from "@/components/dashboard/sessions/visit-sheet"
import { requireDashboard } from "@/lib/analytics/access"
import { visit as getVisit } from "@/lib/analytics/cache"

export default async function VisitSheetPage({
  params,
}: {
  params: Promise<{ id: string; visitId: string }>
}) {
  const { id, visitId } = await params
  const { site, settings } = await requireDashboard(id)
  const detail = await getVisit(site.id, visitId)
  if (!detail) notFound()
  const base = `/sites/${site.publicId}/dashboard`

  return (
    <VisitSheet
      key={visitId}
      title={<VisitMeta visit={detail.visit} />}
      visitorId={detail.visit.visitorId}
      href={`${base}/sessions/${visitId}`}
    >
      <VisitDetail detail={detail} base={base} currency={settings.currency} />
    </VisitSheet>
  )
}
