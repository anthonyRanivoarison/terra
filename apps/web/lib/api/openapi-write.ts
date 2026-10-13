import { errors, ok, siteIdParam } from "@/lib/api/openapi-params"

const write = (
  summary: string,
  operationId: string,
  scope: string,
  body: string,
  description: string
) => ({
  post: {
    summary,
    description,
    operationId,
    tags: ["Ingestion"],
    security: [{ apiKey: [scope] }],
    parameters: [siteIdParam],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: `#/components/schemas/${body}` },
        },
      },
    },
    responses: {
      ...ok("WrittenEvent", "Created", "201"),
      ...ok("WrittenEvent", "Already recorded (idempotent replay)"),
      ...errors(
        "BadRequest",
        "Unauthorized",
        "Forbidden",
        "NotFound",
        "RateLimited"
      ),
    },
  },
})

export const writePaths = {
  "/sites/{siteId}/events": write(
    "Track a goal",
    "trackEvent",
    "write:events",
    "GoalInput",
    "Records a server-side custom event. It joins the visitor's latest visit when that visit was active in the 30 minutes before `timestamp`. Pass `id` to make retries idempotent."
  ),
  "/sites/{siteId}/payments": write(
    "Record a payment",
    "recordPayment",
    "write:payments",
    "PaymentInput",
    "Records a purchase, or a refund when `refunded` is true (stored as a negative amount). Idempotent on `provider` + `id`: replays return 200 with `duplicate: true`."
  ),
}
