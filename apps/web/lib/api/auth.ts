import { apiError } from "@/lib/api/errors"
import {
  findApiKey,
  KEY_PATTERN,
  touchApiKey,
  type Scope,
} from "@/lib/api/keys"
import { consume } from "@/lib/api/rate-limit"

export type ApiAuth = {
  organizationId: string
  keyId: string
  headers: Record<string, string>
}

export async function authenticate(
  request: Request,
  scope: Scope
): Promise<ApiAuth | Response> {
  const header = request.headers.get("authorization") ?? ""
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match) {
    return apiError(
      401,
      "unauthorized",
      "Send your API key as `Authorization: Bearer tk_live_…`."
    )
  }
  const token = match[1]!
  if (!KEY_PATTERN.test(token)) {
    return apiError(401, "unauthorized", "The API key is malformed.")
  }
  const key = await findApiKey(token)
  if (!key) {
    return apiError(401, "unauthorized", "The API key is invalid or revoked.")
  }
  const limit = consume(key.id)
  if (!limit.ok) {
    return apiError(
      429,
      "rate_limited",
      "Too many requests. Retry after the window resets.",
      limit.headers
    )
  }
  if (!key.scopes.includes(scope)) {
    return apiError(
      403,
      "forbidden",
      `This API key is missing the \`${scope}\` scope.`,
      limit.headers
    )
  }
  touchApiKey(key.id)
  return {
    organizationId: key.organizationId,
    keyId: key.id,
    headers: limit.headers,
  }
}
