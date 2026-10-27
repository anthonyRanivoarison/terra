"use client"

import { useState } from "react"

export function useCopy(value: string, resetMs = 1500) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), resetMs)
  }
  return { copied, copy }
}
