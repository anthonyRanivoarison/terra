import { Environment, Paddle } from "@paddle/paddle-node-sdk"

export type BillingEnvironment = "sandbox" | "production"

let client: Paddle | null = null

export function billingEnvironment(): BillingEnvironment {
  return process.env.PADDLE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox"
}

export function billingPaddle(): Paddle {
  if (!client) {
    const key = process.env.PADDLE_API_KEY
    if (!key) throw new Error("PADDLE_API_KEY is not set")
    client = new Paddle(key, {
      environment:
        billingEnvironment() === "production"
          ? Environment.production
          : Environment.sandbox,
    })
  }
  return client
}

export function billingWebhookParser(): Paddle {
  return client ?? new Paddle(process.env.PADDLE_API_KEY || "unset")
}

export function billingEnabled(): boolean {
  return Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_CLIENT_TOKEN)
}
