"use server"

import { revalidatePath } from "next/cache"
import { billingAccess } from "@/lib/billing/access"
import { planById } from "@/lib/billing/plans"
import { changePlan } from "@/lib/billing/portal"

export type ChangePlanState = { error: string | null; message: string | null }

export async function changePlanAction(
  _: ChangePlanState,
  form: FormData
): Promise<ChangePlanState> {
  const access = await billingAccess()
  if (!access?.canManage) {
    return {
      error: "Only owners and admins can change the plan.",
      message: null,
    }
  }
  const plan = planById(String(form.get("plan") ?? ""))
  if (!plan?.priceId)
    return { error: "This plan is not available.", message: null }
  try {
    const changed = await changePlan(access.organizationId, plan.priceId)
    if (!changed)
      return { error: "No active subscription to change.", message: null }
  } catch (error) {
    console.error("[billing] change plan", error)
    return {
      error: "Paddle could not change the plan. Try again.",
      message: null,
    }
  }
  revalidatePath("/settings/billing")
  return {
    error: null,
    message: `Switching to ${plan.name}. It can take a few seconds.`,
  }
}
