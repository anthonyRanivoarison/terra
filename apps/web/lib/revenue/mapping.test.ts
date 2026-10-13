import { describe, expect, test } from "bun:test"
import {
  purchaseFromTransaction,
  refundFromAdjustment,
  visitorFromCustomData,
} from "@/lib/revenue/mapping"

const transaction = {
  id: "txn_01abc",
  status: "completed",
  customerId: "ctm_01xyz",
  currencyCode: "usd",
  customData: { terra_visitor_id: "v_abcdef123456" },
  details: { totals: { total: "4900" } },
  billedAt: "2026-10-01T10:00:00Z",
}

const adjustment = {
  id: "adj_01def",
  action: "refund",
  status: "approved",
  transactionId: "txn_01abc",
  customerId: "ctm_01xyz",
  currencyCode: "USD",
  totals: { total: "1500" },
  createdAt: "2026-10-03T08:00:00Z",
}

describe("purchaseFromTransaction", () => {
  test("maps a completed transaction", () => {
    expect(purchaseFromTransaction(transaction)).toEqual({
      name: "purchase",
      visitorId: "v_abcdef123456",
      visitId: null,
      amountCents: 4900,
      currency: "USD",
      dedupeKey: "purchase:txn_01abc",
      occurredAt: new Date("2026-10-01T10:00:00Z"),
      props: {
        source: "paddle",
        transaction_id: "txn_01abc",
        customer_id: "ctm_01xyz",
      },
    })
  })

  test("accepts datafast ids and falls back to the customer", () => {
    const datafast = { datafast_visitor_id: "df_visitor_0001" }
    expect(visitorFromCustomData(datafast)).toBe("df_visitor_0001")
    const anonymous = purchaseFromTransaction({
      ...transaction,
      customData: null,
    })
    expect(anonymous?.visitorId).toBe("paddle_ctm_01xyz")
  })

  test("ignores invalid visitor ids", () => {
    expect(visitorFromCustomData({ terra_visitor_id: "<script>" })).toBeNull()
  })

  test("skips incomplete or free transactions", () => {
    expect(
      purchaseFromTransaction({ ...transaction, status: "paid" })
    ).toBeNull()
    const free = { ...transaction, details: { totals: { total: "0" } } }
    expect(purchaseFromTransaction(free)).toBeNull()
  })
})

describe("refundFromAdjustment", () => {
  test("maps an approved refund to a negative event on the buyer", () => {
    const ref = { visitorId: "v_abcdef123456", visitId: "visit-1" }
    expect(refundFromAdjustment(adjustment, ref)).toMatchObject({
      name: "refund",
      visitorId: "v_abcdef123456",
      visitId: "visit-1",
      amountCents: -1500,
      currency: "USD",
      dedupeKey: "refund:adj_01def",
    })
  })

  test("counts chargebacks", () => {
    const chargeback = { ...adjustment, action: "chargeback" }
    expect(refundFromAdjustment(chargeback, null)?.visitorId).toBe(
      "paddle_ctm_01xyz"
    )
  })

  test("ignores pending, rejected and credit adjustments", () => {
    for (const change of [
      { status: "pending_approval" },
      { status: "rejected" },
      { action: "credit" },
    ]) {
      expect(
        refundFromAdjustment({ ...adjustment, ...change }, null)
      ).toBeNull()
    }
  })
})
