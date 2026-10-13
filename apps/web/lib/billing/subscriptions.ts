import { sql } from "@terra/db/client"
import { planForPrice } from "@/lib/billing/plans"
import { str } from "@/lib/revenue/paddle-json"

export type PaddleSubscriptionLike = {
  id: string
  status: string
  customerId: string
  updatedAt?: string | null
  customData?: Record<string, unknown> | null
  currentBillingPeriod?: { endsAt?: string | null } | null
  items?: { price?: { id?: string | null } | null }[] | null
}

export type SubscriptionRecord = {
  organizationId: string
  paddleCustomerId: string
  paddleSubscriptionId: string
  plan: string
  status: string
  eventsQuota: number
  currentPeriodEnd: Date | null
  updatedAt: Date
}

export function subscriptionFromPaddle(
  subscription: PaddleSubscriptionLike,
  env: Record<string, string | undefined> = process.env
): SubscriptionRecord | null {
  const organizationId = subscription.customData?.organization_id
  if (typeof organizationId !== "string" || !organizationId) return null
  const plan = (subscription.items ?? [])
    .map((item) => planForPrice(item.price?.id, env))
    .find((found) => found !== null)
  if (!plan) return null
  const end = subscription.currentBillingPeriod?.endsAt
  return {
    organizationId,
    paddleCustomerId: subscription.customerId,
    paddleSubscriptionId: subscription.id,
    plan: plan.id,
    status: subscription.status,
    eventsQuota: plan.quota,
    currentPeriodEnd: end ? new Date(end) : null,
    updatedAt: subscription.updatedAt
      ? new Date(subscription.updatedAt)
      : new Date(),
  }
}

export function subscriptionFromJson(
  data: Record<string, unknown>,
  env: Record<string, string | undefined> = process.env
): SubscriptionRecord | null {
  const id = str(data.id)
  const status = str(data.status)
  const customerId = str(data.customer_id)
  if (!id || !status || !customerId) return null
  const period = data.current_billing_period as { ends_at?: unknown } | null
  const items = Array.isArray(data.items) ? data.items : []
  return subscriptionFromPaddle(
    {
      id,
      status,
      customerId,
      updatedAt: str(data.updated_at),
      customData: (data.custom_data as Record<string, unknown> | null) ?? null,
      currentBillingPeriod: { endsAt: str(period?.ends_at) },
      items: items.map((item: { price?: { id?: unknown } } | null) => ({
        price: { id: str(item?.price?.id) },
      })),
    },
    env
  )
}

export async function upsertSubscription(record: SubscriptionRecord) {
  await sql()`
    INSERT INTO subscriptions (
      organization_id, paddle_customer_id, paddle_subscription_id, plan,
      status, events_quota, current_period_end, updated_at
    )
    VALUES (
      ${record.organizationId}, ${record.paddleCustomerId},
      ${record.paddleSubscriptionId}, ${record.plan}, ${record.status},
      ${record.eventsQuota}, ${record.currentPeriodEnd}, ${record.updatedAt}
    )
    ON CONFLICT (organization_id) DO UPDATE SET
      paddle_customer_id = EXCLUDED.paddle_customer_id,
      paddle_subscription_id = EXCLUDED.paddle_subscription_id,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      events_quota = EXCLUDED.events_quota,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = EXCLUDED.updated_at
    WHERE (
      subscriptions.paddle_subscription_id = EXCLUDED.paddle_subscription_id
      AND subscriptions.updated_at <= EXCLUDED.updated_at
    ) OR (
      subscriptions.paddle_subscription_id <> EXCLUDED.paddle_subscription_id
      AND (EXCLUDED.status <> 'canceled' OR subscriptions.status = 'canceled')
    )
  `
}

export async function getSubscription(
  organizationId: string
): Promise<SubscriptionRecord | null> {
  const [row] = await sql()<SubscriptionRecord[]>`
    SELECT organization_id AS "organizationId",
      paddle_customer_id AS "paddleCustomerId",
      paddle_subscription_id AS "paddleSubscriptionId", plan, status,
      events_quota AS "eventsQuota", current_period_end AS "currentPeriodEnd",
      updated_at AS "updatedAt"
    FROM subscriptions WHERE organization_id = ${organizationId}
  `
  return row ?? null
}
