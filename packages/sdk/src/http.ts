import { TerraError } from "./error.js"

export type HttpConfig = {
  apiKey: string
  baseUrl: string
  fetch: typeof fetch
  maxRetries: number
  timeoutMs: number
}

export type RequestOptions = {
  query?: Record<string, string | undefined>
  body?: unknown
  signal?: AbortSignal
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504])

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function backoff(attempt: number, retryAfter: number | null): number {
  if (retryAfter !== null) return Math.min(retryAfter * 1000, 30_000)
  return 300 * 2 ** attempt + Math.floor(Math.random() * 100)
}

function buildUrl(config: HttpConfig, path: string, options: RequestOptions) {
  const url = new URL(`${config.baseUrl.replace(/\/+$/, "")}/api/v1${path}`)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value)
  }
  return url.toString()
}

async function toError(response: Response): Promise<TerraError> {
  const header = response.headers.get("retry-after")
  const retryAfter = header && /^\d+$/.test(header) ? Number(header) : null
  let code = "http_error"
  let message = `Request failed with status ${response.status}`
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string }
    }
    code = body.error?.code ?? code
    message = body.error?.message ?? message
  } catch {}
  return new TerraError(response.status, code, message, retryAfter)
}

async function attempt(
  config: HttpConfig,
  method: string,
  url: string,
  options: RequestOptions
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeoutMs)
  const abort = () => controller.abort()
  options.signal?.addEventListener("abort", abort)
  try {
    return await config.fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        accept: "application/json",
        ...(options.body === undefined
          ? {}
          : { "content-type": "application/json" }),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    const timedOut = controller.signal.aborted
    throw new TerraError(
      0,
      timedOut ? "timeout" : "network_error",
      timedOut
        ? `Request timed out after ${config.timeoutMs} ms`
        : error instanceof Error
          ? error.message
          : "Network error"
    )
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener("abort", abort)
  }
}

type Outcome<T> = { data: T } | { error: TerraError; retry: boolean }

async function once<T>(
  config: HttpConfig,
  method: string,
  url: string,
  options: RequestOptions
): Promise<Outcome<T>> {
  let response: Response
  try {
    response = await attempt(config, method, url, options)
  } catch (error) {
    if (error instanceof TerraError) return { error, retry: true }
    throw error
  }
  if (!response.ok) {
    return {
      error: await toError(response),
      retry: RETRYABLE.has(response.status),
    }
  }
  const body = (await response.json()) as { data: T }
  return { data: body.data }
}

export async function request<T>(
  config: HttpConfig,
  method: "GET" | "POST",
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(config, path, options)
  for (let tries = 0; ; tries++) {
    const outcome = await once<T>(config, method, url, options)
    if ("data" in outcome) return outcome.data
    if (!outcome.retry || tries >= config.maxRetries) throw outcome.error
    await sleep(backoff(tries, outcome.error.retryAfter))
  }
}
