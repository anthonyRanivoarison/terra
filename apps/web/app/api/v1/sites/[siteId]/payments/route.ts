import { invalid } from "@/lib/api/errors"
import { readJson, siteRoute } from "@/lib/api/handler"
import { parsePayment } from "@/lib/api/validate"
import { insertPayment } from "@/lib/api/write"

export const POST = siteRoute("write:payments", async ({ site, request }) => {
  const payment = parsePayment(await readJson(request))
  if (!payment.ok) return invalid(payment.message)
  const event = await insertPayment(site.uuid, payment.value)
  return Response.json({ data: event }, { status: event.duplicate ? 200 : 201 })
})
