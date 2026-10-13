import { billingPaddle } from "@/lib/billing/paddle"
import { getSubscription } from "@/lib/billing/subscriptions"

export async function portalUrl(
  organizationId: string
): Promise<string | null> {
  const subscription = await getSubscription(organizationId)
  if (!subscription) return null
  const session = await billingPaddle().customerPortalSessions.create(
    subscription.paddleCustomerId,
    [subscription.paddleSubscriptionId]
  )
  return session.urls.general.overview
}

export async function changePlan(
  organizationId: string,
  priceId: string
): Promise<boolean> {
  const subscription = await getSubscription(organizationId)
  if (!subscription || subscription.status === "canceled") return false
  await billingPaddle().subscriptions.update(
    subscription.paddleSubscriptionId,
    {
      items: [{ priceId, quantity: 1 }],
      prorationBillingMode: "prorated_immediately",
    }
  )
  return true
}
