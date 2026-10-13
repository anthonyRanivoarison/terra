import { decrypt } from "@/lib/crypto"
import {
  isApprovedReversal,
  purchaseFromTransaction,
  refundFromAdjustment,
  visitorFromCustomData,
  type PaddleAdjustmentLike,
  type PaddleTransactionLike,
  type PurchaseRef,
} from "@/lib/revenue/mapping"
import { createPaddle, type PaddleFactory } from "@/lib/revenue/paddle-client"
import {
  findPurchase,
  getConnection,
  insertRevenueEvent,
  markBackfilled,
} from "@/lib/revenue/store"

export type BackfillResult = { purchases: number; refunds: number }

type Paddle = ReturnType<PaddleFactory>

export async function purchaseRef(
  siteId: string,
  transactionId: string,
  load: (id: string) => Promise<PaddleTransactionLike | null>
): Promise<PurchaseRef | null> {
  const stored = await findPurchase(siteId, transactionId)
  if (stored) return stored
  const transaction = await load(transactionId)
  const visitorId = visitorFromCustomData(transaction?.customData)
  return visitorId ? { visitorId, visitId: null } : null
}

export const transactionLoader =
  (paddle: Paddle) =>
  async (id: string): Promise<PaddleTransactionLike | null> =>
    paddle.transactions.get(id).catch(() => null)

async function backfillPurchases(siteId: string, paddle: Paddle, since: Date) {
  let count = 0
  const transactions = paddle.transactions.list({
    status: ["completed"],
    "billedAt[GTE]": since.toISOString(),
    perPage: 200,
  })
  for await (const transaction of transactions) {
    const event = purchaseFromTransaction(transaction)
    if (event && (await insertRevenueEvent(siteId, event))) count++
  }
  return count
}

async function backfillRefunds(siteId: string, paddle: Paddle, since: Date) {
  let count = 0
  const adjustments = paddle.adjustments.list({
    status: ["approved"],
    orderBy: "id[DESC]",
    perPage: 50,
  })
  const load = transactionLoader(paddle)
  for await (const adjustment of adjustments as AsyncIterable<PaddleAdjustmentLike>) {
    if (adjustment.createdAt && new Date(adjustment.createdAt) < since) break
    if (!isApprovedReversal(adjustment)) continue
    const ref = await purchaseRef(siteId, adjustment.transactionId!, load)
    const event = refundFromAdjustment(adjustment, ref)
    if (event && (await insertRevenueEvent(siteId, event))) count++
  }
  return count
}

export async function backfill(
  siteId: string,
  days = 90,
  factory: PaddleFactory = createPaddle
): Promise<BackfillResult> {
  const connection = await getConnection(siteId)
  if (!connection) throw new Error("Paddle is not connected for this site")
  const paddle = factory(
    decrypt(connection.apiKeyEncrypted),
    connection.environment
  )
  const since = new Date(Date.now() - days * 86_400_000)
  const purchases = await backfillPurchases(siteId, paddle, since)
  const refunds = await backfillRefunds(siteId, paddle, since)
  await markBackfilled(siteId)
  return { purchases, refunds }
}
