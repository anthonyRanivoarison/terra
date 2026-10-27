import type { Metadata } from "next"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { GlobeBackdrop } from "@/components/app/globe-backdrop"
import { SetupNav } from "@/components/app/setup-nav"
import { NewSiteForm } from "@/components/sites/new-site-form"
import { requireOrganization } from "@/lib/session"

export const metadata: Metadata = { title: "Add a site" }

export default async function NewSitePage() {
  await requireOrganization()
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col overflow-hidden rounded-[inherit]">
      <GlobeBackdrop className="-z-10" />
      <SidebarTrigger className="m-3 md:hidden" />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-6 pb-24">
        <h1 className="sr-only">Add a site</h1>
        <SetupNav current={0} />
        <NewSiteForm />
      </main>
    </div>
  )
}
