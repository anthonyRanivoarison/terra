"use client"

import { useEffect, useRef } from "react"

type ScalarGlobal = {
  createApiReference: (
    target: HTMLElement,
    config: Record<string, unknown>
  ) => { destroy?: () => void }
}

type ScalarReferenceType = { url: string }

const SRC = "https://cdn.jsdelivr.net/npm/@scalar/api-reference"

function loadScalar(): Promise<ScalarGlobal> {
  const ready = () => (window as { Scalar?: ScalarGlobal }).Scalar
  const existing = ready()
  if (existing) return Promise.resolve(existing)
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`
    )
    if (!script) {
      script = document.createElement("script")
      script.src = SRC
      script.async = true
      document.head.append(script)
    }
    script.addEventListener("load", () => {
      const scalar = ready()
      if (scalar) resolve(scalar)
      else reject(new Error("Scalar did not load"))
    })
    script.addEventListener("error", () => reject(new Error("Scalar failed")))
  })
}

export const ScalarReference = ({ url }: ScalarReferenceType) => {
  const target = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let app: { destroy?: () => void } | null = null
    let cancelled = false
    loadScalar()
      .then((scalar) => {
        if (cancelled || !target.current) return
        app = scalar.createApiReference(target.current, {
          url,
          hideClientButton: false,
          withDefaultFonts: false,
          metaData: { title: "Terra API" },
        })
      })
      .catch(() => {
        if (target.current) {
          target.current.textContent =
            "The API reference could not load. Open /api/v1/openapi.json instead."
        }
      })
    return () => {
      cancelled = true
      app?.destroy?.()
    }
  }, [url])

  return <div ref={target} className="min-h-svh" />
}
