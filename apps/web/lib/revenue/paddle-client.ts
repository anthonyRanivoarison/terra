import { Environment, Paddle } from "@paddle/paddle-node-sdk"
import type { PaddleEnvironment } from "@/lib/revenue/store"

export const SITE_EVENTS = [
  "transaction.completed",
  "adjustment.created",
  "adjustment.updated",
] as const

export function createPaddle(apiKey: string, environment: PaddleEnvironment) {
  return new Paddle(apiKey, {
    environment:
      environment === "production"
        ? Environment.production
        : Environment.sandbox,
  })
}

export type PaddleFactory = typeof createPaddle

export function keyEnvironment(apiKey: string): PaddleEnvironment | null {
  if (apiKey.startsWith("pdl_sdbx_")) return "sandbox"
  if (apiKey.startsWith("pdl_live_")) return "production"
  return null
}

export function appUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

export function webhookDestination(publicId: string): string {
  return `${appUrl()}/api/webhooks/paddle/${publicId}`
}
