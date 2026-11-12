"use client"

import { useEffect, useState } from "react"
import { CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react/ssr"

type InstallStatusType = { siteId: string; domain: string; live: boolean }

export const InstallStatus = ({ siteId, domain, live }: InstallStatusType) => {
  const [isLive, setIsLive] = useState(live)

  useEffect(() => {
    if (isLive) return
    const timer = setInterval(async () => {
      const res = await fetch(`/api/sites/${siteId}/status`, {
        cache: "no-store",
      })
      if (res.ok && (await res.json()).live) setIsLive(true)
    }, 3000)
    return () => clearInterval(timer)
  }, [isLive, siteId])

  if (isLive) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-up/10 p-4 text-sm text-up">
        <CheckCircleIcon className="size-5 shrink-0" aria-hidden />
        <p>
          <span className="font-medium">Receiving events.</span> Terra is
          tracking {domain} and every subdomain.
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 rounded-lg bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
      <CircleNotchIcon
        className="mt-0.5 size-5 shrink-0 animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <div className="flex flex-col gap-2">
        <p className="font-medium">Awaiting the first event…</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Paste the script in the head of every page.</li>
          <li>
            Visit{" "}
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              {domain}
            </a>{" "}
            to register the first event yourself.
          </li>
          <li>This page updates on its own.</li>
        </ol>
      </div>
    </div>
  )
}
