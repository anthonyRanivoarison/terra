import { siteRoute } from "@/lib/api/site-route"
import { fetchFavicon } from "@/lib/favicon"

export const GET = siteRoute(async (site) => {
  const icon = await fetchFavicon(site.domain)
  if (!icon)
    return new Response(null, {
      status: 404,
      headers: { "cache-control": "private, max-age=3600" },
    })
  return new Response(icon.body, {
    headers: {
      "content-type": icon.type,
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  })
})
