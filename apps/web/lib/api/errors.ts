export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "invalid_query"
  | "rate_limited"
  | "internal_error"

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  headers?: HeadersInit
): Response {
  return Response.json({ error: { code, message } }, { status, headers })
}

export function invalid(message: string): Response {
  return apiError(400, "invalid_request", message)
}

export function notFound(message = "Not found."): Response {
  return apiError(404, "not_found", message)
}
