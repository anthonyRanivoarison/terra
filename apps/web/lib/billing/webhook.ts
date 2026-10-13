import { billingWebhookParser } from "@/lib/billing/paddle"
import {
  subscriptionFromJson,
  upsertSubscription,
} from "@/lib/billing/subscriptions"
import { parseNotification } from "@/lib/revenue/paddle-json"
import { claimEvent, releaseEvent } from "@/lib/revenue/webhook-events"

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.canceled",
  "subscription.activated",
  "subscription.trialing",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
])

export async function handleBillingWebhook(
  body: string,
  signature: string | null
): Promise<Response> {
  const secret = process.env.PADDLE_BILLING_WEBHOOK_SECRET
  if (!secret || !signature) {
    return new Response("Missing signature", { status: 401 })
  }
  const valid = await billingWebhookParser()
    .webhooks.isSignatureValid(body, secret, signature)
    .catch(() => false)
  if (!valid) return new Response("Invalid signature", { status: 401 })
  const event = parseNotification(body)
  if (!event) return new Response("Invalid payload", { status: 400 })
  if (!SUBSCRIPTION_EVENTS.has(event.eventType)) return new Response("ignored")
  const key = `billing:${event.eventId}`
  if (!(await claimEvent(key))) return new Response("duplicate")
  try {
    const record = subscriptionFromJson(event.data)
    if (record) await upsertSubscription(record)
    else console.warn(`[billing] ${event.eventId} has no organization or plan`)
  } catch (error) {
    console.error(`[billing] ${event.eventType} failed`, error)
    await releaseEvent(key)
    return new Response("Handler failed", { status: 500 })
  }
  return new Response("ok")
}
