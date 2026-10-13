"use server"

import { revalidatePath } from "next/cache"
import { backfill } from "@/lib/revenue/backfill"
import {
  ConnectError,
  connectPaddle,
  disconnectPaddle,
} from "@/lib/revenue/connect"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export type RevenueActionState = {
  error: string | null
  message: string | null
}

async function siteFor(publicId: string) {
  const site = await getSite(await requireOrganization(), publicId)
  if (!site) throw new Error("Site not found")
  return site
}

const done = (publicId: string, message: string): RevenueActionState => {
  revalidatePath(`/sites/${publicId}/settings/revenue`)
  return { error: null, message }
}

const summary = (result: { purchases: number; refunds: number }) =>
  `Imported ${result.purchases} purchases and ${result.refunds} refunds.`

export async function connectAction(
  publicId: string,
  _: RevenueActionState,
  form: FormData
): Promise<RevenueActionState> {
  const site = await siteFor(publicId)
  const apiKey = String(form.get("apiKey") ?? "").trim()
  const environment =
    form.get("environment") === "production" ? "production" : "sandbox"
  if (apiKey.length < 20) {
    return { error: "Paste a Paddle API key.", message: null }
  }
  try {
    await connectPaddle(site.id, apiKey, environment)
  } catch (error) {
    if (error instanceof ConnectError)
      return { error: error.message, message: null }
    console.error("[revenue] connect", error)
    return { error: "Could not connect to Paddle. Try again.", message: null }
  }
  const result = await backfill(site.id).catch((error) => {
    console.error("[revenue] initial backfill", error)
    return null
  })
  return done(
    publicId,
    result
      ? `Connected. ${summary(result)}`
      : "Connected. The backfill failed, run it again."
  )
}

export async function backfillAction(
  publicId: string,
  _: RevenueActionState
): Promise<RevenueActionState> {
  const site = await siteFor(publicId)
  try {
    return done(publicId, summary(await backfill(site.id)))
  } catch (error) {
    console.error("[revenue] backfill", error)
    return {
      error: "The backfill failed. Check that the API key is still valid.",
      message: null,
    }
  }
}

export async function disconnectAction(
  publicId: string,
  _: RevenueActionState
): Promise<RevenueActionState> {
  const site = await siteFor(publicId)
  await disconnectPaddle(site.id)
  return done(publicId, "Paddle disconnected.")
}
