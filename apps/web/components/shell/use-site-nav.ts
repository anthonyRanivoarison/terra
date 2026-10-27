"use client"

import { useParams, useSearchParams } from "next/navigation"

export const useSiteNav = () => {
  const params = useParams<{ id?: string }>()
  const search = useSearchParams()
  const siteId = params.id ?? null
  const query = search.toString()
  return {
    siteId,
    root: siteId ? `/sites/${siteId}` : "",
    keep: (href: string) => (query ? `${href}?${query}` : href),
  }
}
