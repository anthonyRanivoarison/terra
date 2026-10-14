"use client"

import Link from "next/link"
import { useId, type ReactNode } from "react"
import { ChevronDown, TriangleAlert } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useLocalFlag } from "../empty/use-local-flag"
import { useSiteLive } from "./use-site-live"

type AwaitingPanelType = {
  publicId: string
  domain: string
  supportEmail: string
}

const link =
  "font-medium text-amber-800 underline underline-offset-4 hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-50"

export const AwaitingPanel = ({
  publicId,
  domain,
  supportEmail,
}: AwaitingPanelType) => {
  const live = useSiteLive(publicId)
  const [collapsed, setCollapsed] = useLocalFlag("terra:awaiting-collapsed")
  const listId = useId()
  if (live) return null

  const steps: ReactNode[] = [
    <>
      Install the script using the{" "}
      <Link href={`/sites/${publicId}`} className={link}>
        tracking code
      </Link>
    </>,
    <>
      Visit{" "}
      <a
        href={`https://${domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className={link}
      >
        {domain}
      </a>{" "}
      to register the first event yourself
    </>,
    <>Refresh your dashboard</>,
    <>
      Still not working?{" "}
      <a href={`mailto:${supportEmail}`} className={link}>
        Contact support
      </a>
    </>,
  ]

  return (
    <aside
      aria-label="Tracking setup"
      className="fixed inset-x-4 bottom-4 z-40 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 sm:right-auto sm:bottom-6 sm:left-6 sm:w-88 dark:border-amber-500/30 dark:bg-amber-950 dark:text-amber-50"
    >
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-controls={listId}
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-amber-500/50"
      >
        <TriangleAlert
          aria-hidden
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
        />
        <span className="flex-1">Awaiting the first event…</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 motion-safe:transition-transform",
            collapsed && "-rotate-180"
          )}
        />
      </button>
      <ol
        id={listId}
        hidden={collapsed}
        className="flex list-decimal flex-col gap-1.5 px-4 pb-4 pl-10 text-sm text-amber-900 marker:text-amber-700 dark:text-amber-100 dark:marker:text-amber-300"
      >
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </aside>
  )
}
