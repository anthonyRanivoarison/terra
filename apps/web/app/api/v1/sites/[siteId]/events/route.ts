import { invalid } from "@/lib/api/errors"
import { readJson, siteRoute } from "@/lib/api/handler"
import { parseGoal } from "@/lib/api/validate"
import { insertGoal } from "@/lib/api/write"

export const POST = siteRoute("write:events", async ({ site, request }) => {
  const goal = parseGoal(await readJson(request))
  if (!goal.ok) return invalid(goal.message)
  const event = await insertGoal(site.uuid, goal.value, site.domain)
  return Response.json({ data: event }, { status: event.duplicate ? 200 : 201 })
})
