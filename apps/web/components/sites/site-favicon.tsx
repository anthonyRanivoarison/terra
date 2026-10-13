"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type SiteFaviconType = {
  siteId: string
  domain: string
  className?: string
}

export const SiteFavicon = ({ siteId, domain, className }: SiteFaviconType) => {
  const [failed, setFailed] = useState(false)
  const size = cn("size-4 shrink-0 rounded-sm", className)
  if (failed)
    return <Globe aria-hidden className={cn(size, "text-muted-foreground")} />
  return (
    <img
      src={`/api/sites/${encodeURIComponent(siteId)}/favicon`}
      alt=""
      title={domain}
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(size, "object-contain")}
    />
  )
}
