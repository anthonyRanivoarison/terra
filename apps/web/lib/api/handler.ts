import { authenticate } from "@/lib/api/auth"
import { CORS_HEADERS } from "@/lib/api/cors"
import { apiError, notFound } from "@/lib/api/errors"
import type { Scope } from "@/lib/api/keys"
import { findApiSite, type ApiSite } from "@/lib/api/site"

type Context<P> = { params: Promise<P> }

type ApiContext<P> = {
  request: Request
  organizationId: string
  keyId: string
  params: P
}

type SiteContext<P> = ApiContext<P> & { site: ApiSite; search: URLSearchParams }

function withHeaders(response: Response, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  if (!response.headers.has("cache-control")) {
    response.headers.set("cache-control", "no-store")
  }
  return response
}

export function apiRoute<P>(
  scope: Scope,
  handler: (ctx: ApiContext<P>) => Promise<Response>
) {
  return async (request: Request, context: Context<P>) => {
    const cors = request.method === "GET" ? CORS_HEADERS : {}
    try {
      const auth = await authenticate(request, scope)
      if (auth instanceof Response) return withHeaders(auth, cors)
      const response = await handler({
        request,
        organizationId: auth.organizationId,
        keyId: auth.keyId,
        params: await context.params,
      })
      return withHeaders(response, { ...auth.headers, ...cors })
    } catch (error) {
      console.error("[api/v1]", error)
      return withHeaders(
        apiError(500, "internal_error", "Something went wrong on our side."),
        cors
      )
    }
  }
}

export function siteRoute<P extends { siteId: string }>(
  scope: Scope,
  handler: (ctx: SiteContext<P>) => Promise<Response>
) {
  return apiRoute<P>(scope, async (ctx) => {
    const site = await findApiSite(ctx.organizationId, ctx.params.siteId)
    if (!site) return notFound("No site with this id in your organization.")
    const search = new URL(ctx.request.url).searchParams
    return handler({ ...ctx, site, search })
  })
}

export function searchRecord(
  search: URLSearchParams
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {}
  for (const key of new Set(search.keys())) {
    const values = search.getAll(key)
    out[key] = values.length > 1 ? values : values[0]
  }
  return out
}

export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return undefined
  }
  try {
    return await request.json()
  } catch {
    return undefined
  }
}
