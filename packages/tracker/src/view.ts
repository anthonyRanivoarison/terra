import { collectClient } from "./client"
import { touchSession } from "./ids"
import { send } from "./send"
import { onLateVital, takeVitals } from "./vitals"

const HEARTBEAT_MS = 15_000
const IDLE_MS = 30 * 60 * 1000
let firstView = true

export function trackView(visitorId: string): () => void {
  const session = touchSession()
  const viewId = crypto.randomUUID()
  const isFirst = firstView
  firstView = false

  let visibleMs = 0
  let visibleSince: number | null =
    document.visibilityState === "visible" ? Date.now() : null
  let lastActive = Date.now()
  let maxScroll = 0
  let docHeight = document.documentElement.scrollHeight
  let queued = false

  const elapsed = () =>
    Math.round(
      (visibleMs + (visibleSince ? Date.now() - visibleSince : 0)) / 1000
    )

  const ping = (type: "ping" | "leave") =>
    send({
      type,
      sessionId: session.id,
      viewId,
      duration: elapsed(),
      scroll: maxScroll,
      vitals: takeVitals(),
    })

  const measure = () => {
    queued = false
    const seen = window.scrollY + window.innerHeight
    const pct = docHeight > 0 ? Math.min(100, (seen / docHeight) * 100) : 100
    maxScroll = Math.max(maxScroll, Math.round(pct))
  }
  const onScroll = () => {
    lastActive = Date.now()
    if (queued) return
    queued = true
    requestAnimationFrame(measure)
  }
  const resize = new ResizeObserver(() => {
    docHeight = document.documentElement.scrollHeight
  })
  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      if (visibleSince) visibleMs += Date.now() - visibleSince
      visibleSince = null
      ping("leave")
    } else {
      visibleSince = lastActive = Date.now()
      touchSession()
    }
  }
  const onPageHide = () => ping("leave")
  const heartbeat = setInterval(() => {
    if (document.visibilityState !== "visible") return
    if (Date.now() - lastActive > IDLE_MS) return
    touchSession()
    ping("ping")
  }, HEARTBEAT_MS)

  void (
    session.isNew || isFirst ? collectClient() : Promise.resolve(null)
  ).then((client) =>
    send({
      type: "pageview",
      visitorId,
      sessionId: session.id,
      viewId,
      url: location.href,
      title: document.title,
      referrer: session.isNew && isFirst ? document.referrer || null : null,
      client,
    })
  )

  requestAnimationFrame(measure)
  resize.observe(document.body)
  onLateVital(() => ping("ping"))
  window.addEventListener("scroll", onScroll, { passive: true })
  document.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("pagehide", onPageHide)

  return () => {
    ping("leave")
    clearInterval(heartbeat)
    resize.disconnect()
    onLateVital(null)
    window.removeEventListener("scroll", onScroll)
    document.removeEventListener("visibilitychange", onVisibility)
    window.removeEventListener("pagehide", onPageHide)
  }
}
