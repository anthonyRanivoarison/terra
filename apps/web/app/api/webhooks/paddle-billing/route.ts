import { handleBillingWebhook } from "@/lib/billing/webhook"

export async function POST(req: Request) {
  return handleBillingWebhook(
    await req.text(),
    req.headers.get("paddle-signature")
  )
}
