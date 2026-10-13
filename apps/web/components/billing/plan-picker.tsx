"use client"

import { useActionState, useState } from "react"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { changePlanAction } from "@/app/settings/billing/actions"
import type { Plan } from "@/lib/billing/plans"

type PlanPickerType = {
  plans: Plan[]
  currentPlan: string | null
  subscribed: boolean
  canManage: boolean
  clientToken: string
  environment: "sandbox" | "production"
  organizationId: string
  email: string | null
}

const number = new Intl.NumberFormat("en", { notation: "compact" })

let paddlePromise: Promise<Paddle | undefined> | null = null

export const PlanPicker = ({
  plans,
  currentPlan,
  subscribed,
  canManage,
  clientToken,
  environment,
  organizationId,
  email,
}: PlanPickerType) => {
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [state, change, changing] = useActionState(changePlanAction, {
    error: null,
    message: null,
  })

  const checkout = async (plan: Plan) => {
    if (!plan.priceId) return
    setOpening(plan.id)
    setError(null)
    paddlePromise ??= initializePaddle({ token: clientToken, environment })
    const paddle = await paddlePromise.catch(() => undefined)
    setOpening(null)
    if (!paddle) {
      paddlePromise = null
      setError("Could not load the checkout. Try again.")
      return
    }
    paddle.Checkout.open({
      items: [{ priceId: plan.priceId, quantity: 1 }],
      customData: { organization_id: organizationId },
      ...(email ? { customer: { email } } : {}),
      settings: { successUrl: `${window.location.origin}/settings/billing` },
    })
  }

  const message = error ?? state.error
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Plans</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const current = plan.id === currentPlan
          return (
            <li
              key={plan.id}
              className="flex flex-col gap-4 rounded-xl border p-5"
            >
              <div className="flex flex-col gap-1">
                <p className="font-heading text-lg font-semibold">
                  {plan.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {number.format(plan.quota)} events per month
                </p>
              </div>
              {subscribed ? (
                <form action={change} className="mt-auto">
                  <input type="hidden" name="plan" value={plan.id} />
                  <Button
                    type="submit"
                    variant={current ? "outline" : "default"}
                    disabled={current || changing || !canManage}
                    className="w-full"
                  >
                    {current ? "Current plan" : `Switch to ${plan.name}`}
                  </Button>
                </form>
              ) : (
                <Button
                  className="mt-auto w-full"
                  disabled={!canManage || opening !== null}
                  onClick={() => void checkout(plan)}
                >
                  {opening === plan.id && <Spinner />}
                  Start free trial
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      {!canManage && (
        <p className="text-sm text-muted-foreground">
          Only workspace owners and admins can change the plan.
        </p>
      )}
      {message && <p className="text-sm text-destructive">{message}</p>}
      {state.message && (
        <p className="text-sm text-muted-foreground" role="status">
          {state.message}
        </p>
      )}
    </section>
  )
}
