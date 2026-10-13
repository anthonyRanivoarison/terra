"use server"

import { redirect } from "next/navigation"
import { requireOrganization } from "@/lib/session"
import { createSite, normalizeDomain } from "@/lib/sites"
import { isTimezone } from "@/lib/timezones"

export type NewSiteState = { error: string | null }

export async function createSiteAction(
  _: NewSiteState,
  form: FormData
): Promise<NewSiteState> {
  const organizationId = await requireOrganization()
  const domain = normalizeDomain(String(form.get("domain") ?? ""))
  if (!domain) return { error: "Enter a domain like unicorn.com." }
  const name =
    String(form.get("name") ?? "")
      .trim()
      .slice(0, 80) || domain
  const zone = String(form.get("timezone") ?? "")
  const timezone = isTimezone(zone) ? zone : "UTC"
  const publicId = await createSite(organizationId, name, domain, timezone)
  redirect(`/sites/${publicId}`)
}
