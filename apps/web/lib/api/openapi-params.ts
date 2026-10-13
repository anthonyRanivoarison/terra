import { FILTER_KEYS, RANGES } from "@/lib/analytics/params"

const ref = (name: string) => ({ $ref: `#/components/parameters/${name}` })

export const siteIdParam = ref("siteId")

export const queryParams = [
  ref("range"),
  ref("from"),
  ref("to"),
  ref("compare"),
  ...FILTER_KEYS.map((key) => ref(`filter_${key}`)),
]

export const parameters = {
  siteId: {
    name: "siteId",
    in: "path",
    required: true,
    description: "Public site id, as shown in the tracking snippet.",
    schema: { type: "string", pattern: "^ws_[A-Za-z0-9]{8,32}$" },
    example: "ws_8fK2mQ9xLp3vT7aB",
  },
  range: {
    name: "range",
    in: "query",
    description:
      "Preset period in the site's timezone. Use `custom` with `from` and `to`.",
    schema: { type: "string", enum: [...RANGES, "custom"], default: "7d" },
  },
  from: {
    name: "from",
    in: "query",
    description: "First day (inclusive) when `range=custom`.",
    schema: { type: "string", format: "date" },
  },
  to: {
    name: "to",
    in: "query",
    description: "Last day (inclusive) when `range=custom`.",
    schema: { type: "string", format: "date" },
  },
  compare: {
    name: "compare",
    in: "query",
    description:
      "Comparison period: the previous span or the same span a year ago.",
    schema: { type: "string", enum: ["prev", "year"] },
  },
  ...Object.fromEntries(
    FILTER_KEYS.map((key) => [
      `filter_${key}`,
      {
        name: key,
        in: "query",
        description: `Only count visits where \`${key}\` equals this value.`,
        schema: { type: "string", maxLength: 300 },
      },
    ])
  ),
}

const error = (description: string) => ({
  description,
  headers: { ...rateHeaders() },
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
})

function rateHeaders() {
  const header = (description: string) => ({
    description,
    schema: { type: "integer" },
  })
  return {
    "RateLimit-Limit": header("Requests allowed per window."),
    "RateLimit-Remaining": header("Requests left in the current window."),
    "RateLimit-Reset": header("Seconds until the window resets."),
  }
}

export const responses = {
  BadRequest: error("The request is invalid."),
  Unauthorized: error("The API key is missing, malformed or revoked."),
  Forbidden: error("The API key lacks the required scope."),
  NotFound: error("The site or resource does not exist in your organization."),
  RateLimited: error("Too many requests (600 per minute per key)."),
}

export function ok(schema: string, description = "Success", status = "200") {
  return {
    [status]: {
      description,
      headers: rateHeaders(),
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: { $ref: `#/components/schemas/${schema}` } },
          },
        },
      },
    },
  }
}

export const errors = (...codes: (keyof typeof responses)[]) =>
  Object.fromEntries(
    codes.map((code) => [
      {
        BadRequest: "400",
        Unauthorized: "401",
        Forbidden: "403",
        NotFound: "404",
        RateLimited: "429",
      }[code],
      { $ref: `#/components/responses/${code}` },
    ])
  )
