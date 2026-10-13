import type { Metadata } from "next"
import Link from "next/link"
import { sql } from "@terra/db/client"
import { quotaState } from "@terra/db/usage"
import { Button } from "@workspace/ui/components/button"
import { PlanPicker } from "@/components/billing/plan-picker"
import { UsageMeter } from "@/components/billing/usage-meter"
import { billingAccess } from "@/lib/billing/access"
import { billingEnabled, billingEnvironment } from "@/lib/billing/paddle"
import { planById, plans } from "@/lib/billing/plans"
import { getSubscription } from "@/lib/billing/subscriptions"
import { requireOrganization } from "@/lib/session"

export const metadata: Metadata = { title: "Billing" }

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)

export default async function BillingPage() {
  const organizationId = await requireOrganization()
  const [access, quota, subscription] = await Promise.all([
    billingAccess(),
    quotaState(sql(), organizationId),
    getSubscription(organizationId),
  ])
  const live = subscription !== null && subscription.status !== "canceled"
  const planName = live
    ? (planById(subscription.plan)?.name ?? subscription.plan)
    : "Free"

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href="/sites"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Sites
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Billing
        </h1>
      </div>
      <section className="flex flex-col gap-5 rounded-xl border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="font-heading text-2xl font-semibold">{planName}</p>
            {subscription && (
              <p className="text-sm text-muted-foreground">
                {subscription.status.replace("_", " ")}
                {subscription.currentPeriodEnd &&
                  ` · renews ${formatDate(subscription.currentPeriodEnd)}`}
              </p>
            )}
          </div>
          {subscription && access?.canManage && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href="/api/billing/portal" />}
            >
              Manage billing
            </Button>
          )}
        </div>
        <UsageMeter
          used={quota.used}
          quota={quota.quota}
          over={quota.over}
          overGrace={quota.overGrace}
          graceEndsAt={quota.graceEndsAt?.toISOString() ?? null}
        />
      </section>
      {billingEnabled() ? (
        <PlanPicker
          plans={plans().filter((plan) => plan.priceId !== null)}
          currentPlan={live ? subscription.plan : null}
          subscribed={live}
          canManage={access?.canManage ?? false}
          clientToken={process.env.PADDLE_CLIENT_TOKEN ?? ""}
          environment={billingEnvironment()}
          organizationId={organizationId}
          email={access?.email ?? null}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Billing is turned off on this Terra instance.
        </p>
      )}
    </main>
  )
}
