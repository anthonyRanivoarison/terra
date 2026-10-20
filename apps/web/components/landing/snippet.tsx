"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

const SNIPPET = `<script defer data-website-id="ws_…" data-domain="yourdomain.com" src="https://cdn.terra.dev/js/script.js"></script>`

const attributes: [string, string | null][] = [
  ["defer", null],
  ["data-website-id", "ws_…"],
  ["data-domain", "yourdomain.com"],
  ["src", "https://cdn.terra.dev/js/script.js"],
]

export const Snippet = () => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl bg-[oklch(0.2_0.012_264)] text-white">
      <div className="flex items-center justify-between border-b border-white/10 py-1 pr-1 pl-4">
        <span className="font-mono text-xs text-white/70">index.html</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed md:text-sm">
        <code>
          <span className="text-white/60">{"<script"}</span>
          {attributes.map(([name, value]) => (
            <span key={name} className="block pl-4">
              <span className="text-[#7dd3fc]">{name}</span>
              {value ? (
                <>
                  <span className="text-white/60">=</span>
                  <span className="text-white">&quot;{value}&quot;</span>
                </>
              ) : null}
            </span>
          ))}
          <span className="text-white/60">{"></script>"}</span>
        </code>
      </pre>
    </div>
  )
}
