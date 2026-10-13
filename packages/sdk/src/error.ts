export type TerraErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "invalid_query"
  | "rate_limited"
  | "internal_error"
  | "network_error"
  | "timeout"
  | (string & {})

export class TerraError extends Error {
  readonly status: number
  readonly code: TerraErrorCode
  readonly retryAfter: number | null

  constructor(
    status: number,
    code: TerraErrorCode,
    message: string,
    retryAfter: number | null = null
  ) {
    super(message)
    this.name = "TerraError"
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}
