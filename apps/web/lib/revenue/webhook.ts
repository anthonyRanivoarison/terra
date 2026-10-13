import { decrypt } from "@/lib/crypto"
import { purchaseRef, transactionLoader } from "@/lib/revenue/backfill"
import {
  isApprovedReversal,
  purchaseFromTransaction,
  refundFromAdjustment,
  type RevenueEvent,
} from "@/lib/revenue/mapping"
import { createPaddle, type PaddleFactory } from "@/lib/revenue/paddle-client"
import {
  adjustmentFromJson,
  parseNotification,
  transactionFromJson,
  type PaddleNotification,
} from "@/lib/revenue/paddle-json"
import {
  getConnectionByPublicId,
  insertRevenueEvent,
  type PaddleConnection,
} from "@/lib/revenue/store"
import { claimEvent, releaseEvent } from "@/lib/revenue/webhook-events"

type Paddle = ReturnType<PaddleFactory>

async function toEvent(
  notification: PaddleNotification,
  connection: PaddleConnection,
  paddle: Paddle
): Promise<RevenueEvent | null> {
  if (notification.eventType === "transaction.completed") {
    const transaction = transactionFromJson(notification.data)
    return transaction ? purchaseFromTransaction(transaction) : null
  }
  if (
    notification.eventType !== "adjustment.created" &&
    notification.eventType !== "adjustment.updated"
  ) {
    return null
  }
  const adjustment = adjustmentFromJson(notification.data)
  if (!adjustment || !isApprovedReversal(adjustment)) return null
  const ref = await purchaseRef(
    connection.siteId,
    adjustment.transactionId!,
    transactionLoader(paddle)
  )
  return refundFromAdjustment(adjustment, ref)
}

export async function handleSiteWebhook(
  publicId: string,
  body: string,
  signature: string | null,
  factory: PaddleFactory = createPaddle
): Promise<Response> {
  const connection = await getConnectionByPublicId(publicId)
  if (!connection || !signature) {
    return new Response("Unknown endpoint", { status: 404 })
  }
  const paddle = factory(
    decrypt(connection.apiKeyEncrypted),
    connection.environment
  )
  const valid = await paddle.webhooks
    .isSignatureValid(
      body,
      decrypt(connection.webhookSecretEncrypted),
      signature
    )
    .catch(() => false)
  if (!valid) return new Response("Invalid signature", { status: 401 })
  const notification = parseNotification(body)
  if (!notification) return new Response("Invalid payload", { status: 400 })
  const key = `${publicId}:${notification.eventId}`
  if (!(await claimEvent(key))) return new Response("duplicate")
  try {
    const event = await toEvent(notification, connection, paddle)
    if (event) await insertRevenueEvent(connection.siteId, event)
  } catch (error) {
    console.error(`[revenue] ${notification.eventType} failed`, error)
    await releaseEvent(key)
    return new Response("Handler failed", { status: 500 })
  }
  return new Response("ok")
}
