import { describe, expect, test } from "bun:test"
import { evaluateQuota } from "@terra/db/usage"
import { planForPrice } from "@/lib/billing/plans"
import { subscriptionFromPaddle } from "@/lib/billing/subscriptions"

const env = {
  PADDLE_PRICE_STARTER: "pri_starter",
  PADDLE_PRICE_GROWTH: "pri_growth",
  PADDLE_PRICE_SCALE: "pri_scale",
}
const now = new Date("2026-10-20T00:00:00Z")
const day = 86_400_000

describe("evaluateQuota", () => {
  test("under quota", () => {
    const state = evaluateQuota({
      used: 50,
      quota: 100,
      plan: "starter",
      overSince: null,
      now,
    })
    expect(state).toMatchObject({
      over: false,
      overGrace: false,
      overSince: null,
    })
  })

  test("unlimited when there is no quota", () => {
    const state = evaluateQuota({
      used: 1e9,
      quota: null,
      plan: "free",
      overSince: null,
      now,
    })
    expect(state.over).toBe(false)
  })

  test("grace lasts 7 days after going over", () => {
    const since = new Date(now.getTime() - 6 * day)
    const inGrace = evaluateQuota({
      used: 101,
      quota: 100,
      plan: "starter",
      overSince: since,
      now,
    })
    expect(inGrace).toMatchObject({ over: true, overGrace: false })
    expect(inGrace.graceEndsAt).toEqual(new Date(since.getTime() + 7 * day))
    const later = new Date(now.getTime() + day)
    expect(
      evaluateQuota({
        used: 101,
        quota: 100,
        plan: "starter",
        overSince: since,
        now: later,
      }).overGrace
    ).toBe(true)
  })

  test("starts the grace now when first detected", () => {
    const state = evaluateQuota({
      used: 101,
      quota: 100,
      plan: "starter",
      overSince: null,
      now,
    })
    expect(state.overSince).toEqual(now)
  })
})

describe("subscriptions", () => {
  const subscription = {
    id: "sub_01",
    status: "trialing",
    customerId: "ctm_01",
    updatedAt: "2026-10-01T00:00:00Z",
    customData: { organization_id: "org_1" },
    currentBillingPeriod: { endsAt: "2026-10-15T00:00:00Z" },
    items: [{ price: { id: "pri_growth" } }],
  }

  test("maps a price to its plan and quota", () => {
    expect(planForPrice("pri_scale", env)?.quota).toBe(1_000_000)
    expect(subscriptionFromPaddle(subscription, env)).toMatchObject({
      organizationId: "org_1",
      plan: "growth",
      eventsQuota: 100_000,
      status: "trialing",
      currentPeriodEnd: new Date("2026-10-15T00:00:00Z"),
    })
  })

  test("ignores subscriptions without an organization or known price", () => {
    expect(
      subscriptionFromPaddle({ ...subscription, customData: null }, env)
    ).toBeNull()
    const unknown = { ...subscription, items: [{ price: { id: "pri_other" } }] }
    expect(subscriptionFromPaddle(unknown, env)).toBeNull()
  })
})
