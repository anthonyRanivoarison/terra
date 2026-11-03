import { siteConfig } from "@/lib/seo"
import { AwaitingPanel } from "./awaiting-panel"

type AwaitingFirstEventType = {
  site: { publicId: string; domain: string; firstEventAt: Date | null }
}

export const AwaitingFirstEvent = ({ site }: AwaitingFirstEventType) =>
  site.firstEventAt ? null : (
    <AwaitingPanel
      publicId={site.publicId}
      domain={site.domain}
      supportHref={siteConfig.supportHref}
    />
  )
