import type { Metadata } from "next"
import Link from "next/link"
import { CreateKeyForm } from "@/components/settings/api-keys/create-key-form"
import { KeyList } from "@/components/settings/api-keys/key-list"
import { listApiKeys } from "@/lib/api/keys"
import { requireOrganization } from "@/lib/session"

export const metadata: Metadata = { title: "API keys" }

export default async function ApiKeysPage() {
  const keys = await listApiKeys(await requireOrganization())
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">API keys</h1>
        <p className="text-muted-foreground">
          Keys work for every site in this workspace. Read the{" "}
          <Link href="/docs/api" className="underline underline-offset-4">
            API reference
          </Link>{" "}
          or use the{" "}
          <code className="font-mono text-sm">@terra-analytics/sdk</code>{" "}
          package.
        </p>
      </header>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Your keys</h2>
        <KeyList keys={keys} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Create a key</h2>
        <CreateKeyForm />
      </section>
    </main>
  )
}
