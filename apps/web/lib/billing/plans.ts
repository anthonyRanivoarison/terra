export type PlanId = "starter" | "growth" | "scale"

export type Plan = {
  id: PlanId
  name: string
  quota: number
  priceId: string | null
}

const PLAN_DEFS: Omit<Plan, "priceId">[] = [
  { id: "starter", name: "Starter", quota: 10_000 },
  { id: "growth", name: "Growth", quota: 100_000 },
  { id: "scale", name: "Scale", quota: 1_000_000 },
]

const PRICE_ENV: Record<PlanId, string> = {
  starter: "PADDLE_PRICE_STARTER",
  growth: "PADDLE_PRICE_GROWTH",
  scale: "PADDLE_PRICE_SCALE",
}

export function plans(
  env: Record<string, string | undefined> = process.env
): Plan[] {
  return PLAN_DEFS.map((plan) => ({
    ...plan,
    priceId: env[PRICE_ENV[plan.id]] || null,
  }))
}

export function planForPrice(
  priceId: string | null | undefined,
  env: Record<string, string | undefined> = process.env
): Plan | null {
  if (!priceId) return null
  return plans(env).find((plan) => plan.priceId === priceId) ?? null
}

export function planById(id: string, env = process.env): Plan | null {
  return plans(env).find((plan) => plan.id === id) ?? null
}
