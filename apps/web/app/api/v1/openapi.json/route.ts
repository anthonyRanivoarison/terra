import { CORS_HEADERS, preflight } from "@/lib/api/cors"
import { openapi } from "@/lib/api/openapi"

export const GET = () =>
  Response.json(openapi, {
    headers: { ...CORS_HEADERS, "cache-control": "public, max-age=300" },
  })

export const OPTIONS = preflight
