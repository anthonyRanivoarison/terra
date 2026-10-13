"use client"

import { useCallback, useSyncExternalStore } from "react"

const EVENT = "terra:local-flag"

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key) === "1"
  } catch {
    return false
  }
}

const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify)
  window.addEventListener(EVENT, notify)
  return () => {
    window.removeEventListener("storage", notify)
    window.removeEventListener(EVENT, notify)
  }
}

export const useLocalFlag = (key: string) => {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => false
  )
  const set = useCallback(
    (next: boolean) => {
      try {
        if (next) window.localStorage.setItem(key, "1")
        else window.localStorage.removeItem(key)
      } catch {}
      window.dispatchEvent(new Event(EVENT))
    },
    [key]
  )
  return [value, set] as const
}
