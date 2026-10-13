import { listenClicks, type Props } from "./clicks"
import { readConfig, shouldTrack } from "./config"
import { currentSession, setCookieDomain, visitorId } from "./ids"
import { configureSend, send } from "./send"
import { trackView } from "./view"
import { watchVitals } from "./vitals"

type Queue = { q?: unknown[][] }
type Api = {
  goal: (name: string, props?: Props) => void
  visitorId: () => string
  pageview: () => void
}

const script = document.currentScript as HTMLScriptElement | null
const config = readConfig(script)
const win = window as unknown as { terra?: Api & Queue }

if (config && shouldTrack(config)) {
  setCookieDomain(config.domain)
  configureSend(config.endpoint, config.websiteId, config.debug)
  const visitor = visitorId()
  let stop = () => {}
  let path = location.pathname

  const goal = (name: string, props?: Props) =>
    send({
      type: "event",
      visitorId: visitor,
      sessionId: currentSession(),
      url: location.href,
      name,
      props: props ?? null,
    })
  const pageview = () => {
    stop()
    path = location.pathname
    stop = trackView(visitor)
  }
  const onRoute = () => {
    if (location.pathname !== path) pageview()
  }

  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method]
    history[method] = function (...args: Parameters<History["pushState"]>) {
      original.apply(this, args)
      onRoute()
    }
  }
  window.addEventListener("popstate", onRoute)

  const queued = win.terra?.q ?? []
  win.terra = { goal, visitorId: () => visitor, pageview }
  for (const [method, ...args] of queued) {
    if (method === "goal") goal(args[0] as string, args[1] as Props)
  }

  const start = () => {
    watchVitals()
    listenClicks(goal)
    pageview()
  }
  if ("requestIdleCallback" in window)
    requestIdleCallback(start, { timeout: 2000 })
  else setTimeout(start, 1)
}
