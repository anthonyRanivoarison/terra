import { cache } from "react"
import { sql } from "@terra/db/client"
import { isUuid } from "./query"

export type SiteSettings = { timezone: string; currency: string }

const DEFAULTS: SiteSettings = { timezone: "UTC", currency: "USD" }

export const getSiteSettings = cache(
  async (siteId: string): Promise<SiteSettings> => {
    if (!isUuid(siteId)) return DEFAULTS
    const [row] = await sql()<SiteSettings[]>`
      SELECT timezone, currency FROM sites WHERE id = ${siteId}
    `
    return row ?? DEFAULTS
  }
)
