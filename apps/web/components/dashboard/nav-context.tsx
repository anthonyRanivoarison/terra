"use client"

import { createContext, useContext, useTransition, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

type Updates = Record<string, string | null>

type NavContextType = {
  siteId: string
  base: string
  isPending: boolean
  get: (key: string) => string | null
  update: (updates: Updates) => void
  hrefWith: (updates: Updates, pathname?: string) => string
}

const NavContext = createContext<NavContextType | null>(null)

export const useAnalyticsNav = () => {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useAnalyticsNav needs <AnalyticsNavProvider>")
  return ctx
}

type AnalyticsNavProviderType = { siteId: string; children: ReactNode }

export const AnalyticsNavProvider = ({
  siteId,
  children,
}: AnalyticsNavProviderType) => {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const hrefWith = (updates: Updates, path = pathname) => {
    const next = new URLSearchParams(search.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key)
      else next.set(key, value)
    }
    next.delete("page_n")
    const query = next.toString()
    return query ? `${path}?${query}` : path
  }

  const value: NavContextType = {
    siteId,
    base: `/sites/${siteId}/dashboard`,
    isPending,
    get: (key) => search.get(key),
    hrefWith,
    update: (updates) =>
      startTransition(() =>
        router.replace(hrefWith(updates), { scroll: false })
      ),
  }

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

type PendingShellType = { children: ReactNode }

export const PendingShell = ({ children }: PendingShellType) => {
  const { isPending } = useAnalyticsNav()
  return (
    <div className="relative" aria-busy={isPending}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary transition-[transform,opacity] duration-700 ease-out",
          isPending ? "scale-x-75 opacity-100" : "scale-x-100 opacity-0"
        )}
      />
      <div
        className={cn(
          "flex flex-col gap-3 transition-opacity duration-200",
          isPending && "opacity-60"
        )}
      >
        {children}
      </div>
    </div>
  )
}
