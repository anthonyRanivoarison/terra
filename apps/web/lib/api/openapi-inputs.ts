export const int = { type: "integer" }
export const num = { type: "number" }
export const str = { type: "string" }
export const nstr = { type: ["string", "null"] }
export const time = { type: "string", format: "date-time" }
export const obj = (
  properties: Record<string, object>,
  required = Object.keys(properties)
) => ({
  type: "object",
  required,
  properties,
})

export const inputSchemas = {
  Error: obj({
    error: obj({
      code: {
        type: "string",
        enum: [
          "unauthorized",
          "forbidden",
          "not_found",
          "invalid_request",
          "invalid_query",
          "rate_limited",
          "internal_error",
        ],
      },
      message: str,
    }),
  }),
  GoalInput: obj(
    {
      name: {
        type: "string",
        pattern: "^[a-z0-9_:-]{1,64}$",
        example: "signup",
      },
      visitorId: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{8,64}$",
        description:
          "The `_terra_v` cookie (or `terra.visitorId()` in the browser).",
      },
      props: {
        type: "object",
        maxProperties: 10,
        additionalProperties: { type: "string", maxLength: 255 },
        propertyNames: { pattern: "^[a-z0-9_-]{1,64}$" },
      },
      url: {
        type: "string",
        format: "uri",
        description: "Page the goal happened on.",
      },
      timestamp: {
        ...time,
        description: "Defaults to now; up to 30 days back.",
      },
      id: { type: "string", maxLength: 200, description: "Idempotency key." },
    },
    ["name", "visitorId"]
  ),
  PaymentInput: obj(
    {
      id: {
        type: "string",
        maxLength: 200,
        description: "Provider payment id.",
      },
      visitorId: { type: "string", pattern: "^[A-Za-z0-9_-]{8,64}$" },
      amount: {
        type: "integer",
        minimum: 1,
        description: "Minor units (cents).",
      },
      currency: { type: "string", pattern: "^[A-Za-z]{3}$", example: "USD" },
      provider: {
        type: "string",
        pattern: "^[a-z0-9_-]{1,32}$",
        default: "api",
      },
      refunded: { type: "boolean", default: false },
      timestamp: time,
    },
    ["id", "visitorId", "amount", "currency"]
  ),
  WrittenEvent: obj({
    id: { type: "string", format: "uuid" },
    name: str,
    visitId: { type: ["string", "null"], format: "uuid" },
    createdAt: time,
    amount: { type: ["integer", "null"] },
    currency: nstr,
    duplicate: { type: "boolean" },
  }),
}
