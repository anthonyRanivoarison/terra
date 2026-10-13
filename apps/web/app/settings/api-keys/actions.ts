"use server"

import { revalidatePath } from "next/cache"
import { createApiKey, isScope, revokeApiKey } from "@/lib/api/keys"
import { requireOrganization } from "@/lib/session"

export type CreateKeyState = {
  error: string | null
  key: string | null
  name: string | null
}

export async function createKeyAction(
  _: CreateKeyState,
  form: FormData
): Promise<CreateKeyState> {
  const organizationId = await requireOrganization()
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 80)
  if (!name) return { error: "Give the key a name.", key: null, name: null }
  const scopes = [...new Set(form.getAll("scopes").map(String))].filter(isScope)
  if (!scopes.length) {
    return { error: "Pick at least one scope.", key: null, name: null }
  }
  const { key } = await createApiKey(organizationId, name, scopes)
  revalidatePath("/settings/api-keys")
  return { error: null, key, name }
}

export async function revokeKeyAction(form: FormData): Promise<void> {
  const organizationId = await requireOrganization()
  const id = String(form.get("id") ?? "")
  if (!/^[0-9a-f-]{36}$/i.test(id)) return
  await revokeApiKey(organizationId, id)
  revalidatePath("/settings/api-keys")
}
