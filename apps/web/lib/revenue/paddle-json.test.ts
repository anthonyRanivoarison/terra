import { describe, expect, test } from "bun:test"
import {
  purchaseFromTransaction,
  refundFromAdjustment,
} from "@/lib/revenue/mapping"
import {
  adjustmentFromJson,
  parseNotification,
  transactionFromJson,
} from "@/lib/revenue/paddle-json"

describe("webhook payloads", () => {
  test("rejects malformed bodies", () => {
    expect(parseNotification("not json")).toBeNull()
    expect(parseNotification(JSON.stringify({ event_id: "evt" }))).toBeNull()
  })

  test("maps a transaction.completed payload", () => {
    const notification = parseNotification(
      JSON.stringify({
        event_id: "evt_1",
        event_type: "transaction.completed",
        data: {
          id: "txn_1",
          status: "completed",
          customer_id: "ctm_1",
          currency_code: "EUR",
          custom_data: { terra_visitor_id: "v_abcdef123456" },
          details: { totals: { total: "2500" } },
          billed_at: "2026-10-01T00:00:00Z",
        },
      })
    )
    const transaction = transactionFromJson(notification!.data)
    expect(purchaseFromTransaction(transaction!)).toMatchObject({
      visitorId: "v_abcdef123456",
      amountCents: 2500,
      currency: "EUR",
      dedupeKey: "purchase:txn_1",
    })
  })

  test("maps an adjustment payload", () => {
    const adjustment = adjustmentFromJson({
      id: "adj_1",
      action: "refund",
      status: "approved",
      transaction_id: "txn_1",
      currency_code: "EUR",
      totals: { total: "1000" },
    })
    expect(refundFromAdjustment(adjustment!, null)?.amountCents).toBe(-1000)
  })
})
