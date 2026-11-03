"use server"

import { revalidatePath } from "next/cache"
import { refreshAnalytics } from "@/lib/analytics/cache"
import { deleteImport } from "@/lib/imports/store"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export async function deleteImportAction(
  publicId: string,
  importId: string
): Promise<void> {
  const site = await getSite(await requireOrganization(), publicId)
  if (!site) throw new Error("Site not found")
  await deleteImport(site.id, importId)
  refreshAnalytics(site.id)
  revalidatePath(`/sites/${publicId}/settings/import`)
}
